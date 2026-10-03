import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentCustomer } from "../../../lib/customerAuth";

// ====================================================
// GET - PAW POINTS BALANCE + TRANSACTION HISTORY
// ====================================================

export async function GET() {
  try {
    // ==================================================
    // 1. CHECK SECURE LOGIN SESSION
    // ==================================================

    const loggedInCustomer =
      await getCurrentCustomer();

    if (!loggedInCustomer) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login to view your Paw Points.",
        },
        {
          status: 401,
        }
      );
    }

    const customerId =
      loggedInCustomer.id;

    // ==================================================
    // 2. GET CUSTOMER INFORMATION
    // ==================================================

    const customer =
      await prisma.customer.findUnique({
        where: {
          id: customerId,
        },

        select: {
          id: true,
          name: true,
        },
      });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ==================================================
    // 3. GET ALL REWARD TRANSACTIONS
    // ==================================================

    const transactions =
      await prisma.rewardTransaction.findMany({
        where: {
          customerId,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    // ==================================================
    // 4. CALCULATE CURRENT BALANCE
    // ==================================================
    //
    // CREDIT -> adds points
    // DEBIT  -> subtracts points
    // ==================================================

    const balance =
      transactions.reduce(
        (total, transaction) => {
          if (
            transaction.type === "CREDIT"
          ) {
            return (
              total +
              transaction.points
            );
          }

          if (
            transaction.type === "DEBIT"
          ) {
            return (
              total -
              transaction.points
            );
          }

          return total;
        },
        0
      );

    // ==================================================
    // 5. CALCULATE TOTAL EARNED
    // ==================================================

    const totalEarned =
      transactions
        .filter(
          (transaction) =>
            transaction.type === "CREDIT"
        )
        .reduce(
          (total, transaction) =>
            total +
            transaction.points,
          0
        );

    // ==================================================
    // 6. CALCULATE TOTAL USED
    // ==================================================

    const totalUsed =
      transactions
        .filter(
          (transaction) =>
            transaction.type === "DEBIT"
        )
        .reduce(
          (total, transaction) =>
            total +
            transaction.points,
          0
        );

    // ==================================================
    // 7. FORMAT TRANSACTION HISTORY
    // ==================================================

    const formattedTransactions =
      transactions.map(
        (transaction) => ({
          id:
            transaction.id,

          type:
            transaction.type,

          points:
            transaction.points,

          reason:
            transaction.reason,

          adminName:
            transaction.adminName,

          createdAt:
            transaction.createdAt,
        })
      );

    // ==================================================
    // 8. RETURN RESPONSE
    // ==================================================

    return NextResponse.json({
      success: true,

      customer: {
        id:
          customer.id,

        name:
          customer.name,
      },

      rewards: {
        balance,
        totalEarned,
        totalUsed,
      },

      transactions:
        formattedTransactions,
    });
  } catch (error) {
    console.error(
      "GET /api/rewards error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not load Paw Points.",
      },
      {
        status: 500,
      }
    );
  }
}