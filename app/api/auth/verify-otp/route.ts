import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../../../lib/prisma";

// ====================================================
// POST - VERIFY EMAIL OTP
// ====================================================

export async function POST(request: Request) {
  try {
    // ==================================================
    // 1. READ REQUEST
    // ==================================================

    const body = await request.json();

    const name = String(body.name ?? "").trim();

    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const mobile = String(body.mobile ?? "").trim();

    const otp = String(body.otp ?? "").trim();

    // ==================================================
    // 2. VALIDATE NAME
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
    // 3. VALIDATE EMAIL
    // ==================================================

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(email) ||
      email.length > 254
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 4. VALIDATE MOBILE
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
    // 5. VALIDATE OTP
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
    // 6. FIND OTP USING EMAIL
    // ==================================================

    const otpRecord =
      await prisma.customerOTP.findFirst({
        where: {
          email,
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
    // 7. CHECK OTP EXPIRY
    // ==================================================

    if (
      otpRecord.expiresAt.getTime() <= Date.now()
    ) {
      await prisma.customerOTP.deleteMany({
        where: {
          email,
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
    // 8. CHECK ATTEMPT LIMIT
    // ==================================================

    if (otpRecord.attempts >= 5) {
      await prisma.customerOTP.deleteMany({
        where: {
          email,
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
    // 9. HASH ENTERED OTP
    // ==================================================

    const enteredOtpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // ==================================================
    // 10. COMPARE OTP
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

      // Delete OTP after final failed attempt
      if (attemptsLeft === 0) {
        await prisma.customerOTP.deleteMany({
          where: {
            email,
          },
        });
      }

      return NextResponse.json(
        {
          success: false,

          message:
            attemptsLeft > 0
              ? `Invalid OTP. ${attemptsLeft} attempt(s) remaining.`
              : "Too many incorrect attempts. Please request a new OTP.",
        },
        {
          status: attemptsLeft > 0 ? 401 : 429,
        }
      );
    }

    // ==================================================
    // 11. OTP CORRECT - DELETE OTP
    // ==================================================

    await prisma.customerOTP.deleteMany({
      where: {
        email,
      },
    });
// ==================================================
// 12. FIND CUSTOMER BY EMAIL AND MOBILE
// ==================================================

const customerByEmail =
  await prisma.customer.findUnique({
    where: {
      email,
    },
  });

const customerByMobile =
  await prisma.customer.findUnique({
    where: {
      mobile,
    },
  });

let customer;

// ==================================================
// 13. RESOLVE EXISTING / NEW CUSTOMER
// ==================================================

// CASE 1:
// Email and mobile point to TWO different customers.
//
// This can happen because the old version of Pet PWA
// used mobile-number login.
//
// We must NOT try to copy the mobile number onto the
// email customer because mobile is unique.
if (
  customerByEmail &&
  customerByMobile &&
  customerByEmail.id !== customerByMobile.id
) {
  return NextResponse.json(
    {
      success: false,
      message:
        "This email and phone number belong to different existing accounts. Please use the details associated with the same account.",
    },
    {
      status: 409,
    }
  );
}

// CASE 2:
// Customer already exists by email.
if (customerByEmail) {
  customer =
    await prisma.customer.update({
      where: {
        id: customerByEmail.id,
      },

      data: {
        name,
        mobile,
      },
    });
}

// CASE 3:
// Existing old customer found using mobile.
//
// Add the newly verified email to that same customer.
else if (customerByMobile) {
  customer =
    await prisma.customer.update({
      where: {
        id: customerByMobile.id,
      },

      data: {
        name,
        email,
      },
    });
}

// CASE 4:
// Completely new customer.
else {
  customer =
    await prisma.customer.create({
      data: {
        name,
        email,
        mobile,
      },
    });
} 

    // ==================================================
    // 14. CREATE RANDOM SESSION TOKEN
    // ==================================================

    const sessionToken = crypto
      .randomBytes(32)
      .toString("hex");

    // Only hash is stored in database
    const tokenHash = crypto
      .createHash("sha256")
      .update(sessionToken)
      .digest("hex");

    // Session valid for 7 days
    const sessionExpiresAt = new Date(
      Date.now() +
        7 * 24 * 60 * 60 * 1000
    );

    // ==================================================
    // 15. CREATE CUSTOMER SESSION
    // ==================================================

    await prisma.customerSession.create({
      data: {
        customerId: customer.id,
        tokenHash,
        expiresAt: sessionExpiresAt,
      },
    });

    // ==================================================
    // 16. SUCCESS RESPONSE
    // ==================================================

    const response = NextResponse.json({
      success: true,

      message:
        "Email verified and login successful.",

      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        mobile: customer.mobile,
      },
    });

    // ==================================================
    // 17. SECURE LOGIN COOKIE
    // ==================================================

    response.cookies.set(
      "customerSession",
      sessionToken,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV === "production",

        sameSite: "lax",

        path: "/",

        maxAge:
          60 * 60 * 24 * 7,
      }
    );

    // ==================================================
    // 18. REMOVE OLD customerId COOKIE
    // ==================================================

    response.cookies.set(
      "customerId",
      "",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV === "production",

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
        message: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}