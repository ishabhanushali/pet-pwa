import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "../../../../lib/prisma";

// ====================================================
// POST - CUSTOMER LOGOUT
// ====================================================

export async function POST() {
  try {
    // ==================================================
    // 1. GET CUSTOMER SESSION COOKIE
    // ==================================================

    const cookieStore = await cookies();

    const sessionCookie =
      cookieStore.get("customerSession");

    // ==================================================
    // 2. DELETE SESSION FROM DATABASE
    // ==================================================

    if (sessionCookie?.value) {
      const tokenHash = crypto
        .createHash("sha256")
        .update(sessionCookie.value)
        .digest("hex");

      // deleteMany is intentional:
      // logout should still succeed even if the
      // session was already deleted or expired.

      await prisma.customerSession.deleteMany({
        where: {
          tokenHash,
        },
      });
    }

    // ==================================================
    // 3. CREATE SUCCESS RESPONSE
    // ==================================================

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });

    // ==================================================
    // 4. REMOVE CUSTOMER SESSION COOKIE
    // ==================================================

    response.cookies.set(
      "customerSession",
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

    // Also remove the old customerId cookie
    // if an old development cookie still exists.

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
      "POST /api/auth/logout error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Could not logout.",
      },
      {
        status: 500,
      }
    );
  }
}