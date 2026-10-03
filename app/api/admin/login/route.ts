import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../../../../lib/prisma";

// ====================================================
// ADMIN LOGIN
// ====================================================

export async function POST(request: Request) {
  try {
    // ----------------------------------------------
    // 1. READ LOGIN DETAILS
    // ----------------------------------------------

    const body = await request.json();

    const email = String(
      body.email || ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      body.password || ""
    );

    // ----------------------------------------------
    // 2. VALIDATE
    // ----------------------------------------------

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------
    // 3. FIND ADMIN
    // ----------------------------------------------

    const admin =
      await prisma.admin.findUnique({
        where: {
          email,
        },
      });

    // Keep same error for wrong email/password.
    // This avoids revealing which admin emails exist.

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }

    // ----------------------------------------------
    // 4. VERIFY PASSWORD
    // ----------------------------------------------

    const passwordCorrect =
      await bcrypt.compare(
        password,
        admin.passwordHash
      );

    if (!passwordCorrect) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }

    // ----------------------------------------------
    // 5. CREATE RANDOM SESSION TOKEN
    // ----------------------------------------------

    const sessionToken =
      crypto.randomBytes(32).toString("hex");

    // Store only hash in database.

    const tokenHash =
      crypto
        .createHash("sha256")
        .update(sessionToken)
        .digest("hex");

    // Session expires after 8 hours.

    const expiresAt =
      new Date(
        Date.now() +
          8 * 60 * 60 * 1000
      );

    // ----------------------------------------------
    // 6. REMOVE EXPIRED SESSIONS
    // ----------------------------------------------

    await prisma.adminSession.deleteMany({
      where: {
        adminId: admin.id,

        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // ----------------------------------------------
    // 7. SAVE SESSION
    // ----------------------------------------------

    await prisma.adminSession.create({
      data: {
        adminId: admin.id,
        tokenHash,
        expiresAt,
      },
    });

    // ----------------------------------------------
    // 8. CREATE HTTP-ONLY COOKIE
    // ----------------------------------------------

    const response =
      NextResponse.json({
        success: true,

        message:
          "Admin login successful.",

        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });

    response.cookies.set({
      name: "adminSession",
      value: sessionToken,

      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",

      path: "/",

      maxAge:
        8 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error(
      "Admin login error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not login as admin.",
      },
      {
        status: 500,
      }
    );
  }
}