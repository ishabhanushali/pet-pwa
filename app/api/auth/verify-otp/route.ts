import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../../../lib/prisma";

// ====================================================
// POST - VERIFY CUSTOMER OTP
// ====================================================

export async function POST(request: Request) {
  try {
    // ==================================================
    // 1. READ REQUEST
    // ==================================================

    const body = await request.json();

    const mobile = String(
      body.mobile || ""
    ).trim();

    const otp = String(
      body.otp || ""
    ).trim();

    // ==================================================
    // 2. VALIDATE MOBILE NUMBER
    // ==================================================

    if (!/^[6-9]\d{9}$/.test(mobile)) {
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
    // 3. VALIDATE OTP FORMAT
    // ==================================================

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid 6-digit OTP.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 4. FIND OTP RECORD
    // ==================================================

    const otpRecord =
      await prisma.customerOTP.findFirst({
        where: {
          mobile,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,
          message:
            "OTP not found. Please request a new OTP.",
        },
        {
          status: 401,
        }
      );
    }

    // ==================================================
    // 5. CHECK OTP EXPIRY
    // ==================================================

    if (
      otpRecord.expiresAt.getTime() <=
      Date.now()
    ) {
      await prisma.customerOTP.deleteMany({
        where: {
          mobile,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "OTP has expired. Please request a new OTP.",
        },
        {
          status: 401,
        }
      );
    }

    // ==================================================
    // 6. CHECK ATTEMPT LIMIT
    // ==================================================
    //
    // Maximum 5 incorrect attempts.
    // ==================================================

    if (otpRecord.attempts >= 5) {
      await prisma.customerOTP.deleteMany({
        where: {
          mobile,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Too many incorrect attempts. Please request a new OTP.",
        },
        {
          status: 429,
        }
      );
    }

    // ==================================================
    // 7. HASH ENTERED OTP
    // ==================================================

    const enteredOtpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // ==================================================
    // 8. COMPARE OTP HASHES
    // ==================================================

    if (enteredOtpHash !== otpRecord.otpHash) {
      const updatedOtp =
        await prisma.customerOTP.update({
          where: {
            id: otpRecord.id,
          },

          data: {
            attempts: {
              increment: 1,
            },
          },
        });

      const attemptsLeft = Math.max(
        0,
        5 - updatedOtp.attempts
      );

      return NextResponse.json(
        {
          success: false,

          message:
            attemptsLeft > 0
              ? `Invalid OTP. ${attemptsLeft} attempt(s) remaining.`
              : "Too many incorrect attempts. Please request a new OTP.",
        },
        {
          status:
            attemptsLeft > 0
              ? 401
              : 429,
        }
      );
    }

    // ==================================================
    // 9. OTP IS CORRECT - DELETE IT
    // ==================================================
    //
    // OTP becomes single-use after successful verification.
    // ==================================================

    await prisma.customerOTP.deleteMany({
      where: {
        mobile,
      },
    });

    // ==================================================
    // 10. FIND OR CREATE CUSTOMER
    // ==================================================

    let customer =
      await prisma.customer.findUnique({
        where: {
          mobile,
        },
      });

    if (!customer) {
      customer =
        await prisma.customer.create({
          data: {
            mobile,
            name: "New Customer",
          },
        });
    }

    // ==================================================
    // 11. CREATE SECURE SESSION TOKEN
    // ==================================================

    const sessionToken = crypto
      .randomBytes(32)
      .toString("hex");

    // Store only the hash in PostgreSQL.

    const tokenHash = crypto
      .createHash("sha256")
      .update(sessionToken)
      .digest("hex");

    // Session expires after 7 days.

    const sessionExpiresAt =
      new Date(
        Date.now() +
          7 * 24 * 60 * 60 * 1000
      );

    // ==================================================
    // 12. CREATE DATABASE SESSION
    // ==================================================

    await prisma.customerSession.create({
      data: {
        customerId:
          customer.id,

        tokenHash,

        expiresAt:
          sessionExpiresAt,
      },
    });

    // ==================================================
    // 13. CREATE SUCCESS RESPONSE
    // ==================================================

    const response =
      NextResponse.json({
        success: true,

        message:
          "OTP verified successfully.",

        customer: {
          id:
            customer.id,

          name:
            customer.name,

          mobile:
            customer.mobile,

          email:
            customer.email,
        },
      });

    // ==================================================
    // 14. SET SECURE SESSION COOKIE
    // ==================================================

    response.cookies.set(
      "customerSession",
      sessionToken,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        path: "/",

        maxAge:
          60 * 60 * 24 * 7,
      }
    );

    // ==================================================
    // 15. REMOVE OLD INSECURE COOKIE
    // ==================================================

    response.cookies.set(
      "customerId",
      "",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        path: "/",

        maxAge: 0,
      }
    );

    return response;
  } catch (error) {
    console.error(
      "POST /api/auth/verify-otp error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}