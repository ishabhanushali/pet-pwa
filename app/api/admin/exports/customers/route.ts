import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "../../../../../lib/prisma";

async function getAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("adminSession");

  if (!sessionCookie?.value) {
    return null;
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(sessionCookie.value)
    .digest("hex");

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
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

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.adminSession.delete({
      where: { id: session.id },
    });

    return null;
  }

  return session.admin;
}

function csvValue(
  value: string | number | null | undefined
) {
  if (value === null || value === undefined) {
    return '""';
  }

  return `"${String(value).replace(/"/g, '""')}"`;
}

export async function GET() {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login as admin.",
        },
        { status: 401 }
      );
    }

    const customers = await prisma.customer.findMany({
      include: {
        addresses: {
          select: {
            id: true,
          },
        },

        orders: {
          select: {
            id: true,
          },
        },

        pets: {
          select: {
            id: true,
          },
        },

        rewardTransactions: {
          select: {
            type: true,
            points: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const rows: string[] = [];

    rows.push(
      [
        "Customer ID",
        "Name",
        "Mobile",
        "Email",
        "Pet Count",
        "Order Count",
        "Address Count",
        "Paw Points Balance",
        "Created At",
      ]
        .map(csvValue)
        .join(",")
    );

    for (const customer of customers) {
      const pawPointsBalance =
        customer.rewardTransactions.reduce(
          (balance, transaction) => {
            if (transaction.type === "CREDIT") {
              return balance + transaction.points;
            }

            return balance - transaction.points;
          },
          0
        );

      rows.push(
        [
          customer.id,
          customer.name,
          customer.mobile,
          customer.email ?? "",
          customer.pets.length,
          customer.orders.length,
          customer.addresses.length,
          pawPointsBalance,
          customer.createdAt.toISOString(),
        ]
          .map(csvValue)
          .join(",")
      );
    }

    const csv = "\uFEFF" + rows.join("\r\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="pet-pwa-customers.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Customers CSV export error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not export customers.",
      },
      { status: 500 }
    );
  }
}