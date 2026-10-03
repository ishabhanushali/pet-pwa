import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentCustomer } from "../../../lib/customerAuth";

// ====================================================
// GET LOGGED-IN CUSTOMER PROFILE
// ====================================================

export async function GET() {
  try {
    // Get customer using secure customerSession cookie
    const loggedInCustomer = await getCurrentCustomer();

    if (!loggedInCustomer) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: loggedInCustomer.id,
      },

      select: {
        id: true,
        name: true,
        mobile: true,
        email: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error(
      "GET /api/profile error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Could not load profile.",
      },
      { status: 500 }
    );
  }
}

// ====================================================
// UPDATE LOGGED-IN CUSTOMER PROFILE
// ====================================================

export async function PUT(request: Request) {
  try {
    // Get customer using secure customerSession cookie
    const loggedInCustomer = await getCurrentCustomer();

    if (!loggedInCustomer) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    // ==================================================
    // VALIDATE NAME
    // ==================================================

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter your name.",
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is too long.",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // VALIDATE EMAIL
    // ==================================================

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    if (email.length > 254) {
      return NextResponse.json(
        {
          success: false,
          message: "Email address is too long.",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // CHECK IF EMAIL IS ALREADY USED
    // ==================================================

    if (email) {
      const existingCustomer =
        await prisma.customer.findUnique({
          where: {
            email,
          },
        });

      if (
        existingCustomer &&
        existingCustomer.id !== loggedInCustomer.id
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This email address is already being used by another account.",
          },
          { status: 409 }
        );
      }
    }

    // ==================================================
    // UPDATE CUSTOMER
    // ==================================================

    const customer = await prisma.customer.update({
      where: {
        id: loggedInCustomer.id,
      },

      data: {
        name,
        email: email || null,
      },

      select: {
        id: true,
        name: true,
        mobile: true,
        email: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      customer,
    });
  } catch (error) {
    console.error(
      "PUT /api/profile error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Could not update profile.",
      },
      { status: 500 }
    );
  }
}