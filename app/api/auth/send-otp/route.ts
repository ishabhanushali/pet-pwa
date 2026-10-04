import { NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "../../../../lib/prisma";
import { sendOtpEmail } from "../../../../lib/emailOtp";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();

    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const mobile = String(body.mobile ?? "").trim();

    // ==================================================
    // 1. VALIDATE NAME
    // ==================================================

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter your full name.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 2. VALIDATE EMAIL
    // ==================================================

    if (!EMAIL_REGEX.test(email) || email.length > 254) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 3. VALIDATE MOBILE NUMBER
    // ==================================================

    if (!MOBILE_REGEX.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid 10-digit Indian mobile number.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 4. CHECK OTP COOLDOWN
    // ==================================================

    const latestOtp = await prisma.customerOTP.findFirst({
      where: {
        email,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    if (latestOtp) {
      const cooldown = 60 * 1000;

      const elapsed =
        Date.now() - latestOtp.createdAt.getTime();

      if (elapsed < cooldown) {
        const seconds = Math.ceil(
          (cooldown - elapsed) / 1000
        );

        return NextResponse.json(
          {
            success: false,
            message: `Please wait ${seconds} second(s) before requesting another OTP.`,
          },
          {
            status: 429,
          }
        );
      }
    }

    // ==================================================
    // 5. GENERATE RANDOM 6-DIGIT OTP
    // ==================================================

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    // ==================================================
    // 6. HASH OTP
    // ==================================================

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // OTP valid for 5 minutes
    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // ==================================================
    // 7. DELETE OLD OTPs
    // ==================================================

    await prisma.customerOTP.deleteMany({
      where: {
        email,
      },
    });

    // ==================================================
    // 8. SAVE HASHED OTP IN DATABASE
    // ==================================================

    await prisma.customerOTP.create({
      data: {
        email,
        otpHash,
        expiresAt,
        attempts: 0,
      },
    });

    // ==================================================
    // 9. SEND REAL OTP EMAIL
    // ==================================================

    try {
      await sendOtpEmail({
        to: email,
        otp,
      });
    } catch (error) {
      console.error("Email sending failed:", error);

      // Remove OTP because email was not delivered
      await prisma.customerOTP.deleteMany({
        where: {
          email,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Could not send OTP email. Please try again.",
        },
        {
          status: 502,
        }
      );
    }

    // ==================================================
    // 10. SUCCESS
    // IMPORTANT: Never return the OTP to the browser
    // ==================================================

    return NextResponse.json({
      success: true,
      message:
        "OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error(
      "POST /api/auth/send-otp error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}