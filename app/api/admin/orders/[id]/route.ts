import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "../../../../../lib/prisma";

// ====================================================
// VERIFY ADMIN SESSION
// ====================================================

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

  if (!session) {
    return null;
  }

  // Check whether session has expired
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.adminSession.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  return session.admin;
}

// ====================================================
// ALLOWED ORDER STATUSES
// These match schema.prisma exactly
// ====================================================

const allowedStatuses = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

type AllowedStatus = (typeof allowedStatuses)[number];

// ====================================================
// PUT - UPDATE ORDER STATUS
// ====================================================

export async function PUT(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // ------------------------------------------------
    // 1. VERIFY ADMIN
    // ------------------------------------------------

    const admin = await getAdmin();

    if (!admin) {
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

    // ------------------------------------------------
    // 2. GET ORDER ID
    // ------------------------------------------------

    const { id } = await context.params;

    const orderId = Number(id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID.",
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------
    // 3. READ REQUEST BODY
    // ------------------------------------------------

    const body = await request.json();

    const status = String(body.status || "")
      .trim()
      .toUpperCase();

    // ------------------------------------------------
    // 4. VALIDATE STATUS
    // ------------------------------------------------

    if (!allowedStatuses.includes(status as AllowedStatus)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid order status. Allowed statuses are PENDING, CONFIRMED, PACKED, SHIPPED, DELIVERED and CANCELLED.",
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------
    // 5. FIND EXISTING ORDER
    // ------------------------------------------------

    const existingOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
      },

      include: {
        customer: {
          select: {
            id: true,
            name: true,
            mobile: true,
            email: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ------------------------------------------------
    // 6. SAME STATUS
    // ------------------------------------------------

    if (existingOrder.status === status) {
      return NextResponse.json({
        success: true,

        message: `Order #${existingOrder.orderNumber} is already ${status}.`,

        order: {
          id: existingOrder.id,
          orderNumber: existingOrder.orderNumber,
          status: existingOrder.status,
          updatedAt: existingOrder.updatedAt,
        },

        admin: {
          id: admin.id,
          name: admin.name,
        },
      });
    }

    // ------------------------------------------------
    // 7. UPDATE ORDER STATUS
    // ------------------------------------------------

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        status: status as AllowedStatus,
      },
    });

    // ------------------------------------------------
    // 8. SUCCESS
    // ------------------------------------------------

    return NextResponse.json({
      success: true,

      message: `Order #${updatedOrder.orderNumber} status updated to ${updatedOrder.status}.`,

      order: {
        id: updatedOrder.id,

        orderNumber: updatedOrder.orderNumber,

        status: updatedOrder.status,

        updatedAt: updatedOrder.updatedAt,
      },

      customer: {
        id: existingOrder.customer.id,

        name: existingOrder.customer.name,

        mobile: existingOrder.customer.mobile,

        email: existingOrder.customer.email,
      },

      admin: {
        id: admin.id,

        name: admin.name,
      },
    });
  } catch (error) {
    console.error("Admin order update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not update order status.",
      },
      {
        status: 500,
      }
    );
  }
}