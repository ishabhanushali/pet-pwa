import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import { prisma } from "../../../../lib/prisma";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const mobile = String(body.mobile ?? "").trim();
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");

    // Name validation
    if (name.length < 2 || name.length > 80) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter your full name.",
        },
        { status: 400 }
      );
    }

    // Email validation
    if (!EMAIL_REGEX.test(email) || email.length > 254) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // Mobile validation
    if (!MOBILE_REGEX.test(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid 10-digit Indian mobile number.",
        },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must contain at least 8 characters.",
        },
        { status: 400 }
      );
    }

    if (password.length > 128) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is too long.",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Passwords do not match.",
        },
        { status: 400 }
      );
    }

    // Check email and mobile separately
    const [customerByEmail, customerByMobile] =
      await Promise.all([
        prisma.customer.findUnique({
          where: { email },
        }),

        prisma.customer.findUnique({
          where: { mobile },
        }),
      ]);

    // Email already registered
    if (customerByEmail) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An account with this email already exists. Please login.",
        },
        { status: 409 }
      );
    }

    // Mobile already registered
    if (customerByMobile) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An account with this phone number already exists. Please login.",
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        mobile,
        passwordHash,
      },
    });

    // Create secure session token
    const sessionToken = crypto
      .randomBytes(32)
      .toString("hex");

    // Store only hash in database
    const tokenHash = crypto
      .createHash("sha256")
      .update(sessionToken)
      .digest("hex");

    const sessionExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await prisma.customerSession.create({
      data: {
        customerId: customer.id,
        tokenHash,
        expiresAt: sessionExpiresAt,
      },
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          mobile: customer.mobile,
        },
      },
      { status: 201 }
    );

    // Secure login cookie
    response.cookies.set(
      "customerSession",
      sessionToken,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    // Remove old cookie if present
    response.cookies.set("customerId", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error(
      "POST /api/auth/signup error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}