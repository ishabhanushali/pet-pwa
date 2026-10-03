import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentCustomer } from "../../../lib/customerAuth";

// ====================================================
// GET ALL ADDRESSES OF LOGGED-IN CUSTOMER
// ====================================================

export async function GET() {
  try {
    const customer = await getCurrentCustomer();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: {
        customerId: customer.id,
      },

      orderBy: [
        {
          isDefault: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error(
      "GET /api/addresses error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Could not load addresses.",
      },
      { status: 500 }
    );
  }
}

// ====================================================
// ADD NEW ADDRESS
// ====================================================

export async function POST(request: Request) {
  try {
    const customer = await getCurrentCustomer();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const address = String(
      body.address || ""
    ).trim();

    const landmark = String(
      body.landmark || ""
    ).trim();

    const city = String(
      body.city || ""
    ).trim();

    const state = String(
      body.state || ""
    ).trim();

    const pincode = String(
      body.pincode || ""
    ).trim();

    // ==================================================
    // REQUIRED FIELD VALIDATION
    // ==================================================

    if (
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please fill all required address fields.",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // LENGTH VALIDATION
    // ==================================================

    if (address.length > 300) {
      return NextResponse.json(
        {
          success: false,
          message: "Address is too long.",
        },
        { status: 400 }
      );
    }

    if (landmark.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message: "Landmark is too long.",
        },
        { status: 400 }
      );
    }

    if (city.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "City name is too long.",
        },
        { status: 400 }
      );
    }

    if (state.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "State name is too long.",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // PIN CODE VALIDATION
    // ==================================================

    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid 6-digit PIN code.",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // CHECK EXISTING ADDRESSES
    // ==================================================

    const addressCount =
      await prisma.address.count({
        where: {
          customerId: customer.id,
        },
      });

    // ==================================================
    // CREATE ADDRESS
    // ==================================================

    const newAddress =
      await prisma.address.create({
        data: {
          customerId: customer.id,

          address,

          landmark:
            landmark || null,

          city,

          state,

          pincode,

          // First address becomes default automatically.
          isDefault:
            addressCount === 0,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Address added successfully.",
        address: newAddress,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/addresses error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Could not add address.",
      },
      { status: 500 }
    );
  }
}