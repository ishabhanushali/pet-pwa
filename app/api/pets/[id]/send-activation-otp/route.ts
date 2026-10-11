
import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";

import { prisma } from "../../../../../lib/prisma";
import { getCurrentCustomer } from "../../../../../lib/customerAuth";

export const runtime = "nodejs";

// Gmail SMTP connection
function createMailTransport() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPassword) {
    throw new Error("Gmail environment variables are missing.");
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailPassword.replace(/\s/g, ""),
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

// Escape user-provided text before inserting into HTML.
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return replacements[character] || character;
  });
}

export async function POST(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // 1. Check customer login
    const customer = await getCurrentCustomer();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in to activate your Pet ID.",
        },
        { status: 401 }
      );
    }

    // 2. Check customer's registered email
    const email = customer.email?.trim();

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please add a valid email address to your profile before activating your Pet ID.",
        },
        { status: 400 }
      );
    }

    // 3. Check pet ID parameter
    const { id } = await context.params;
    const petId = Number(id);

    if (!Number.isSafeInteger(petId) || petId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid pet ID.",
        },
        { status: 400 }
      );
    }

    // 4. Verify pet belongs to logged-in customer
    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        customerId: customer.id,
      },
      include: {
        petId: true,
      },
    });

    if (!pet) {
      return NextResponse.json(
        {
          success: false,
          message: "Pet not found.",
        },
        { status: 404 }
      );
    }

    if (!pet.petId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please issue a permanent Pet ID first.",
        },
        { status: 400 }
      );
    }

    if (pet.petId.status !== "UNCLAIMED") {
      return NextResponse.json(
        {
          success: false,
          message: "This Pet ID cannot be activated.",
        },
        { status: 400 }
      );
    }

    // 5. Ensure Gmail is configured
    if (
      !process.env.GMAIL_USER ||
      !process.env.GMAIL_APP_PASSWORD
    ) {
      console.error("Gmail SMTP configuration missing.");

      return NextResponse.json(
        {
          success: false,
          message:
            "Email service is not configured. Please contact support.",
        },
        { status: 503 }
      );
    }

    // 6. Check resend cooldown (60 seconds)
    // Keep customer.mobile here because the existing
    // activation verification endpoint uses this key.
    const existingOtp =
      await prisma.petActivationOTP.findFirst({
        where: {
          petId,
          mobile: customer.mobile,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (existingOtp) {
      const elapsed =
        Date.now() - existingOtp.createdAt.getTime();

      const cooldown = 60 * 1000;

      if (elapsed < cooldown) {
        const secondsRemaining = Math.ceil(
          (cooldown - elapsed) / 1000
        );

        return NextResponse.json(
          {
            success: false,
            message:
              `Please wait ${secondsRemaining} seconds before requesting another OTP.`,
            retryAfter: secondsRemaining,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(secondsRemaining),
            },
          }
        );
      }
    }

    // 7. Generate a secure random six-digit OTP
    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    // 8. Hash the OTP before database storage
    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // 9. OTP expires in five minutes
    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // 10. Build attractive email
    const safePetName = escapeHtml(pet.name);
    const safePetCode = escapeHtml(pet.petId.petCode);

    const html = `
      <div style="
        margin:0;
        padding:35px 15px;
        background:#f7faf6;
        font-family:Arial,Helvetica,sans-serif;
      ">
        <div style="
          max-width:480px;
          margin:auto;
          padding:35px 25px;
          border-radius:24px;
          background:#ffffff;
          text-align:center;
          border:1px solid #e5eee5;
        ">
          <div style="
            font-size:45px;
            margin-bottom:12px;
          ">
            🐾
          </div>

          <h1 style="
            margin:0;
            color:#194532;
            font-size:27px;
          ">
            Pet PWA
          </h1>

          <p style="
            color:#d36f39;
            font-size:12px;
            font-weight:bold;
            letter-spacing:2px;
            margin-top:25px;
          ">
            DIGITAL PET ID ACTIVATION
          </p>

          <h2 style="
            color:#194532;
            font-size:24px;
            margin-bottom:10px;
          ">
            One paw closer! 🐶
          </h2>

          <p style="
            color:#60786b;
            line-height:1.8;
            font-size:14px;
          ">
            You're activating the digital Pet ID
            for <strong>${safePetName}</strong>.
            Use this special code to continue!
          </p>

          <div style="
            margin:25px 0;
            padding:24px;
            background:#eaf7ed;
            border-radius:18px;
          ">
            <p style="
              margin:0 0 10px;
              font-size:12px;
              color:#60786b;
              font-weight:bold;
            ">
              YOUR 6-DIGIT OTP
            </p>

            <div style="
              font-size:36px;
              font-weight:900;
              color:#205d43;
              letter-spacing:8px;
            ">
              ${otp}
            </div>
          </div>

          <p style="
            color:#60786b;
            font-size:13px;
          ">
            Permanent Pet ID:
            <strong>${safePetCode}</strong>
          </p>

          <p style="
            color:#d36f39;
            font-size:13px;
            font-weight:bold;
          ">
            ⏰ Valid for 5 minutes
          </p>

          <p style="
            color:#809387;
            font-size:12px;
            line-height:1.7;
            margin-top:25px;
          ">
            Never share this OTP with anyone.
            If you did not request this activation,
            please ignore this email.
          </p>

          <div style="
            margin-top:25px;
            border-top:1px solid #edf0eb;
            padding-top:20px;
            color:#205d43;
            font-size:13px;
            font-weight:bold;
          ">
            Made with love for happy paws 💚
          </div>
        </div>
      </div>
    `;

    const transporter = createMailTransport();

    // 11. Store OTP before sending, so a quickly
    // delivered email can be verified immediately.
    await prisma.$transaction(async (tx) => {
      await tx.petActivationOTP.deleteMany({
        where: {
          petId,
          mobile: customer.mobile,
        },
      });

      await tx.petActivationOTP.create({
        data: {
          petId,
          mobile: customer.mobile,
          otpHash,
          attempts: 0,
          expiresAt,
        },
      });
    });

    // 12. Send OTP from your Gmail account
    try {
      await transporter.sendMail({
        from: {
          name: "Pet PWA",
          address: process.env.GMAIL_USER!,
        },
        to: email,
        subject: "🐾 Your Pet PWA Activation OTP",
        text:
          `Hello!\n\n` +
          `Your activation OTP for ${pet.name} ` +
          `(${pet.petId.petCode}) is ${otp}.\n\n` +
          `This OTP expires in 5 minutes.\n` +
          `Never share it with anyone.\n\n` +
          `Pet PWA`,
        html,
      });
    } catch (mailError) {
      console.error("Gmail send error:", mailError);

      // Remove only the OTP created by this request.
      await prisma.petActivationOTP.deleteMany({
        where: {
          petId,
          mobile: customer.mobile,
          otpHash,
        },
      }).catch((cleanupError) => {
        console.error("OTP cleanup error:", cleanupError);
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Could not send the email. Please try again later.",
        },
        { status: 502 }
      );
    }

    // 13. Return success without exposing OTP
    const [localPart, domain] = email.split("@");
    const maskedEmail =
      localPart.slice(0, 2) +
      "***@" +
      domain;

    return NextResponse.json({
      success: true,
      message: "Activation OTP sent to your email.",
      email: maskedEmail,
      expiresIn: 300,
    });
  } catch (error) {
    console.error(
      "Pet activation email OTP error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not generate activation OTP. Please try again.",
      },
      { status: 500 }
    );
  }
}
