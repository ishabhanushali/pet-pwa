import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import { prisma } from "../../../../lib/prisma";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const password = String(body.password ?? "");

    // Validate email
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // Validate password
    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter your password.",
        },
        { status: 400 }
      );
    }

    // Find customer
    const customer = await prisma.customer.findUnique({
      where: {
        email,
      },
    });

    // Do not reveal whether email/password was wrong
    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Old OTP-created accounts may not have passwordHash
    if (!customer.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This account does not have a password yet. Please create a new password-enabled account or contact support.",
        },
        { status: 401 }
      );
    }

    // Compare password with stored hash
    const passwordMatches = await bcrypt.compare(
      password,
      customer.passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Generate session token
    const sessionToken = crypto
      .randomBytes(32)
      .toString("hex");

    // Save only hash in database
    const tokenHash = crypto
      .createHash("sha256")
      .update(sessionToken)
      .digest("hex");

    const sessionExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    // Optional cleanup of expired sessions
    await prisma.customerSession.deleteMany({
      where: {
        customerId: customer.id,
        expiresAt: {
          lte: new Date(),
        },
      },
    });

    // Create new session
    await prisma.customerSession.create({
      data: {
        customerId: customer.id,
        tokenHash,
        expiresAt: sessionExpiresAt,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        mobile: customer.mobile,
      },
    });

    // Browser receives raw token in secure HTTP-only cookie
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

    // Remove old customerId cookie
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
      "POST /api/auth/login error:",
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