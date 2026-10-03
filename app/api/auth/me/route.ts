import { NextResponse } from "next/server";
import { getCurrentCustomer } from "../../../../lib/customerAuth";

// ====================================================
// GET - CURRENT LOGGED-IN CUSTOMER
// ====================================================

export async function GET() {
  try {
    // ==================================================
    // 1. VERIFY SECURE CUSTOMER SESSION
    // ==================================================

    const customer =
      await getCurrentCustomer();

    // ==================================================
    // 2. NOT LOGGED IN / INVALID SESSION
    // ==================================================

    if (!customer) {
      return NextResponse.json(
        {
          loggedIn: false,
          customer: null,
        },
        {
          status: 401,
        }
      );
    }

    // ==================================================
    // 3. RETURN LOGGED-IN CUSTOMER
    // ==================================================

    return NextResponse.json({
      loggedIn: true,

      customer: {
        id: customer.id,
        name: customer.name,
        mobile: customer.mobile,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/auth/me error:",
      error
    );

    return NextResponse.json(
      {
        loggedIn: false,
        customer: null,
        message: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}