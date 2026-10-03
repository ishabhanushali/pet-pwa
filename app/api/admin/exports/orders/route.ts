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

    const orders = await prisma.order.findMany({
      include: {
        customer: {
          select: {
            name: true,
            mobile: true,
            email: true,
          },
        },

        address: true,

        items: {
          include: {
            product: {
              select: {
                name: true,
                brand: true,
                packSize: true,
              },
            },
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
        "Order ID",
        "Order Number",
        "Customer Name",
        "Mobile",
        "Email",
        "Status",
        "Payment Method",
        "Payment Status",
        "Subtotal",
        "Delivery Charge",
        "Total",
        "Items",
        "Delivery Address",
        "Landmark",
        "City",
        "State",
        "Pincode",
        "Created At",
      ]
        .map(csvValue)
        .join(",")
    );

    for (const order of orders) {
      const items = order.items
        .map(
          (item) =>
            `${item.product.brand} ${item.product.name} ${item.product.packSize} x ${item.quantity}`
        )
        .join(" | ");

      rows.push(
        [
          order.id,
          order.orderNumber,
          order.customer.name,
          order.customer.mobile,
          order.customer.email ?? "",
          order.status,
          order.paymentMethod,
          order.paymentStatus,
          Number(order.subtotal),
          Number(order.deliveryCharge),
          Number(order.total),
          items,
          order.address.address,
          order.address.landmark ?? "",
          order.address.city,
          order.address.state,
          order.address.pincode,
          order.createdAt.toISOString(),
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
          'attachment; filename="pet-pwa-orders.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Orders CSV export error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not export orders.",
      },
      { status: 500 }
    );
  }
}