import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "../../../../lib/prisma";

export async function POST() {
  try {
    const cookieStore =
      await cookies();

    const sessionCookie =
      cookieStore.get(
        "adminSession"
      );

    // ================================================
    // DELETE DATABASE SESSION
    // ================================================

    if (sessionCookie?.value) {
      const tokenHash =
        crypto
          .createHash("sha256")
          .update(
            sessionCookie.value
          )
          .digest("hex");

      await prisma.adminSession.deleteMany({
        where: {
          tokenHash,
        },
      });
    }

    // ================================================
    // RESPONSE
    // ================================================

    const response =
      NextResponse.json({
        success: true,
        message:
          "Admin logged out successfully.",
      });

    // ================================================
    // DELETE BROWSER COOKIE
    // ================================================

    response.cookies.set({
      name: "adminSession",
      value: "",

      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",

      path: "/",

      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error(
      "Admin logout error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not logout.",
      },
      {
        status: 500,
      }
    );
  }
}