import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "../../../../lib/prisma";

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
// GET - ALL ORDERS
// ====================================================

export async function GET() {
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
    // 2. LOAD ALL ORDERS
    // ------------------------------------------------

    const orders = await prisma.order.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            mobile: true,
            email: true,
          },
        },

        address: {
          select: {
            id: true,
            address: true,
            landmark: true,
            city: true,
            state: true,
            pincode: true,
          },
        },

        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                category: true,
                packSize: true,
                imageUrl: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 200,
    });

    // ------------------------------------------------
    // 3. FORMAT ORDERS
    // ------------------------------------------------

    const formattedOrders = orders.map((order) => ({
      id: order.id,

      orderNumber: order.orderNumber,

      status: order.status,

      paymentMethod: order.paymentMethod,

      paymentStatus: order.paymentStatus,

      subtotal: Number(order.subtotal),

      deliveryCharge: Number(order.deliveryCharge),

      total: Number(order.total),

      paymentGatewayOrderId: order.paymentGatewayOrderId,

      paymentGatewayPaymentId: order.paymentGatewayPaymentId,

      createdAt: order.createdAt,

      updatedAt: order.updatedAt,

      // ----------------------------------------------
      // CUSTOMER
      // ----------------------------------------------

      customer: {
        id: order.customer.id,

        name: order.customer.name,

        mobile: order.customer.mobile,

        email: order.customer.email,
      },

      // ----------------------------------------------
      // DELIVERY ADDRESS
      // ----------------------------------------------

      address: {
        id: order.address.id,

        address: order.address.address,

        landmark: order.address.landmark,

        city: order.address.city,

        state: order.address.state,

        pincode: order.address.pincode,
      },

      // ----------------------------------------------
      // ORDER ITEMS
      // ----------------------------------------------

      items: order.items.map((item) => ({
        id: item.id,

        productId: item.productId,

        quantity: item.quantity,

        price: Number(item.price),

        mrp: Number(item.mrp),

        product: {
          id: item.product.id,

          name: item.product.name,

          brand: item.product.brand,

          category: item.product.category,

          packSize: item.product.packSize,

          imageUrl: item.product.imageUrl,
        },
      })),
    }));

    // ------------------------------------------------
    // 4. SUCCESS
    // ------------------------------------------------

    return NextResponse.json({
      success: true,

      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },

      count: formattedOrders.length,

      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Admin orders GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not load orders.",
      },
      {
        status: 500,
      }
    );
  }
}