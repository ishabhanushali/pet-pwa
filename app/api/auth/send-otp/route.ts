import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../../../lib/prisma";

// ====================================================
// POST - SEND CUSTOMER OTP
// ====================================================

export async function POST(request: Request) {
  try {
    // ==================================================
    // 1. READ MOBILE NUMBER
    // ==================================================

    const body = await request.json();

    const mobile = String(
      body.mobile || ""
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
    // 3. CHECK REQUEST COOLDOWN
    // ==================================================
    //
    // A new OTP can only be requested after 60 seconds.
    // This prevents rapid OTP generation for one number.
    // ==================================================

    const existingOtp =
      await prisma.customerOTP.findFirst({
        where: {
          mobile,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    if (existingOtp) {
      const ageInMilliseconds =
        Date.now() -
        existingOtp.createdAt.getTime();

      const cooldownMilliseconds =
        60 * 1000;

      if (
        ageInMilliseconds <
        cooldownMilliseconds
      ) {
        const secondsRemaining =
          Math.ceil(
            (
              cooldownMilliseconds -
              ageInMilliseconds
            ) / 1000
          );

        return NextResponse.json(
          {
            success: false,

            message:
              `Please wait ${secondsRemaining} second(s) before requesting another OTP.`,

            retryAfter:
              secondsRemaining,
          },
          {
            status: 429,

            headers: {
              "Retry-After":
                String(secondsRemaining),
            },
          }
        );
      }
    }

    // ==================================================
    // 4. GENERATE RANDOM 6-DIGIT OTP
    // ==================================================

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    // ==================================================
    // 5. HASH OTP
    // ==================================================
    //
    // Never store the plain OTP in PostgreSQL.
    // ==================================================

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // ==================================================
    // 6. SET 5-MINUTE EXPIRY
    // ==================================================

    const expiresAt =
      new Date(
        Date.now() +
          5 * 60 * 1000
      );

    // ==================================================
    // 7. DELETE OLD OTPs
    // ==================================================

    await prisma.customerOTP.deleteMany({
      where: {
        mobile,
      },
    });

    // ==================================================
    // 8. STORE NEW OTP
    // ==================================================

    await prisma.customerOTP.create({
      data: {
        mobile,
        otpHash,
        expiresAt,
        attempts: 0,
      },
    });

    // ==================================================
    // 9. DEVELOPMENT MODE
    // ==================================================
    //
    // For local development only, return the OTP so
    // we can test without an SMS provider.
    //
    // Never return the OTP in production.
    // ==================================================

    if (
      process.env.NODE_ENV !==
      "production"
    ) {
      console.log(
        `Development OTP for ${mobile}: ${otp}`
      );

      return NextResponse.json({
        success: true,

        message:
          "OTP generated successfully.",

        demoOtp:
          otp,
      });
    }

    // ==================================================
    // 10. PRODUCTION
    // ==================================================
    //
    // Before production launch, an SMS provider must
    // send the generated OTP here.
    // ==================================================

    return NextResponse.json({
      success: true,
      message:
        "OTP sent successfully.",
    });
  } catch (error) {
    console.error(
      "POST /api/auth/send-otp error:",
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