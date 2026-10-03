import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "../../../../lib/prisma";

// ====================================================
// POST - ADD / DEDUCT PAW POINTS
// ====================================================

export async function POST(request: Request) {
  try {
    // ================================================
    // 1. GET ADMIN SESSION COOKIE
    // ================================================

    const cookieStore = await cookies();

    const sessionCookie =
      cookieStore.get("adminSession");

    if (!sessionCookie) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login as admin.",
        },
        {
          status: 401,
        }
      );
    }

    // ================================================
    // 2. HASH COOKIE TOKEN
    // ================================================

    const tokenHash = crypto
      .createHash("sha256")
      .update(sessionCookie.value)
      .digest("hex");

    // ================================================
    // 3. VERIFY SESSION IN DATABASE
    // ================================================

    const adminSession =
      await prisma.adminSession.findUnique({
        where: {
          tokenHash,
        },

        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

    if (!adminSession) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin session is invalid. Please login again.",
        },
        {
          status: 401,
        }
      );
    }

    // ================================================
    // 4. CHECK SESSION EXPIRY
    // ================================================

    if (
      adminSession.expiresAt.getTime() <=
      Date.now()
    ) {
      await prisma.adminSession.delete({
        where: {
          id: adminSession.id,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Admin session expired. Please login again.",
        },
        {
          status: 401,
        }
      );
    }

    const admin =
      adminSession.admin;

    // ================================================
    // 5. READ REQUEST
    // ================================================

    const body =
      await request.json();

    const customerId =
      Number(body.customerId);

    const type =
      String(body.type || "")
        .trim()
        .toUpperCase();

    const points =
      Number(body.points);

    const reason =
      String(body.reason || "")
        .trim();

    // ================================================
    // 6. VALIDATE CUSTOMER ID
    // ================================================

    if (
      !Number.isInteger(customerId) ||
      customerId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid Customer ID.",
        },
        {
          status: 400,
        }
      );
    }

    // ================================================
    // 7. VALIDATE TRANSACTION TYPE
    // ================================================

    if (
      type !== "CREDIT" &&
      type !== "DEBIT"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Transaction type must be CREDIT or DEBIT.",
        },
        {
          status: 400,
        }
      );
    }

    // ================================================
    // 8. VALIDATE POINTS
    // ================================================

    if (
      !Number.isInteger(points) ||
      points <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Points must be a positive whole number.",
        },
        {
          status: 400,
        }
      );
    }

    // ================================================
    // 9. VALIDATE REASON
    // ================================================

    if (reason.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid reason.",
        },
        {
          status: 400,
        }
      );
    }

    if (reason.length > 250) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Reason must be 250 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    // ================================================
    // 10. FIND CUSTOMER
    // ================================================

    const customer =
      await prisma.customer.findUnique({
        where: {
          id: customerId,
        },

        select: {
          id: true,
          name: true,
          mobile: true,
        },
      });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ================================================
    // 11. GET EXISTING TRANSACTIONS
    // ================================================

    const existingTransactions =
      await prisma.rewardTransaction.findMany({
        where: {
          customerId,
        },

        select: {
          type: true,
          points: true,
        },
      });

    // ================================================
    // 12. CALCULATE CURRENT BALANCE
    // ================================================

    const currentBalance =
      existingTransactions.reduce(
        (balance, transaction) => {
          if (
            transaction.type ===
            "CREDIT"
          ) {
            return (
              balance +
              transaction.points
            );
          }

          return (
            balance -
            transaction.points
          );
        },
        0
      );

    // ================================================
    // 13. PREVENT INVALID DEBIT
    // ================================================

    if (
      type === "DEBIT" &&
      points > currentBalance
    ) {
      return NextResponse.json(
        {
          success: false,

          message: `Cannot deduct ${points} points. Customer only has ${currentBalance} Paw Points.`,
        },
        {
          status: 400,
        }
      );
    }

    // ================================================
    // 14. CREATE TRANSACTION
    // ================================================

    const transaction =
      await prisma.rewardTransaction.create({
        data: {
          customerId,

          type,

          points,

          reason,

          // IMPORTANT:
          // We no longer trust an admin name sent
          // from the browser.
          // Use authenticated admin from session.
          adminName:
            admin.name,
        },
      });

    // ================================================
    // 15. CALCULATE NEW BALANCE
    // ================================================

    const newBalance =
      type === "CREDIT"
        ? currentBalance + points
        : currentBalance - points;

    // ================================================
    // 16. RETURN SUCCESS
    // ================================================

    return NextResponse.json({
      success: true,

      message:
        type === "CREDIT"
          ? `${points} Paw Points added successfully.`
          : `${points} Paw Points deducted successfully.`,

      customer,

      transaction,

      previousBalance:
        currentBalance,

      balance:
        newBalance,

      admin: {
        id: admin.id,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error(
      "Admin rewards error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not update Paw Points.",
      },
      {
        status: 500,
      }
    );
  }
}