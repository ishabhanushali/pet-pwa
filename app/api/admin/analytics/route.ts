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

  // Check session expiry
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
// GET - ADMIN ANALYTICS
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
    // 2. BASIC COUNTS
    // ------------------------------------------------

    const [
      totalCustomers,
      totalProducts,
      totalPets,
      totalPetIDs,
      activePetIDs,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      packedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      prisma.customer.count(),

      prisma.product.count(),

      prisma.pet.count(),

      prisma.petID.count(),

      prisma.petID.count({
        where: {
          status: "ACTIVE",
        },
      }),

      prisma.order.count(),

      prisma.order.count({
        where: {
          status: "PENDING",
        },
      }),

      prisma.order.count({
        where: {
          status: "CONFIRMED",
        },
      }),

      prisma.order.count({
        where: {
          status: "PACKED",
        },
      }),

      prisma.order.count({
        where: {
          status: "SHIPPED",
        },
      }),

      prisma.order.count({
        where: {
          status: "DELIVERED",
        },
      }),

      prisma.order.count({
        where: {
          status: "CANCELLED",
        },
      }),
    ]);

    // ------------------------------------------------
    // 3. REVENUE
    // ------------------------------------------------
    // Count delivered orders as completed revenue.
    // This avoids counting cancelled/pending orders.
    // ------------------------------------------------

    const deliveredRevenue =
      await prisma.order.aggregate({
        where: {
          status: "DELIVERED",
        },

        _sum: {
          total: true,
        },
      });

    const totalRevenue = Number(
      deliveredRevenue._sum.total ?? 0
    );

    // ------------------------------------------------
    // 4. PAW POINTS
    // ------------------------------------------------

    const rewardTransactions =
      await prisma.rewardTransaction.findMany({
        select: {
          type: true,
          points: true,
        },
      });

    let totalPointsCredited = 0;
    let totalPointsDebited = 0;

    for (const transaction of rewardTransactions) {
      if (transaction.type === "CREDIT") {
        totalPointsCredited += transaction.points;
      } else {
        totalPointsDebited += transaction.points;
      }
    }

    const pawPointsBalance =
      totalPointsCredited - totalPointsDebited;

    // ------------------------------------------------
    // 5. PRODUCT / STOCK ANALYTICS
    // ------------------------------------------------

    const [
      availableProducts,
      unavailableProducts,
      totalStock,
    ] = await Promise.all([
      prisma.product.count({
        where: {
          inStock: true,
        },
      }),

      prisma.product.count({
        where: {
          inStock: false,
        },
      }),

      prisma.product.aggregate({
        _sum: {
          stock: true,
        },
      }),
    ]);

    // ------------------------------------------------
    // 6. RECENT ORDERS
    // ------------------------------------------------

    const recentOrders =
      await prisma.order.findMany({
        take: 5,

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
          total: true,
          createdAt: true,

          customer: {
            select: {
              id: true,
              name: true,
              mobile: true,
            },
          },
        },
      });

    // ------------------------------------------------
    // 7. TOP SELLING PRODUCTS
    // ------------------------------------------------

    const orderItems =
      await prisma.orderItem.groupBy({
        by: ["productId"],

        _sum: {
          quantity: true,
        },

        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },

        take: 5,
      });

    const productIds =
      orderItems.map((item) => item.productId);

    const topProductDetails =
      productIds.length > 0
        ? await prisma.product.findMany({
            where: {
              id: {
                in: productIds,
              },
            },

            select: {
              id: true,
              name: true,
              brand: true,
              packSize: true,
            },
          })
        : [];

    const topProducts =
      orderItems.map((item) => {
        const product =
          topProductDetails.find(
            (product) =>
              product.id === item.productId
          );

        return {
          productId: item.productId,

          name:
            product?.name ||
            "Unknown Product",

          brand:
            product?.brand || "",

          packSize:
            product?.packSize || "",

          quantitySold:
            item._sum.quantity ?? 0,
        };
      });

    // ------------------------------------------------
    // 8. RETURN ANALYTICS
    // ------------------------------------------------

    return NextResponse.json({
      success: true,

      admin,

      analytics: {
        customers: {
          total: totalCustomers,
        },

        products: {
          total: totalProducts,
          available: availableProducts,
          unavailable: unavailableProducts,
          totalStock:
            totalStock._sum.stock ?? 0,
        },

        pets: {
          total: totalPets,
        },

        petIDs: {
          total: totalPetIDs,
          active: activePetIDs,
          inactive:
            totalPetIDs - activePetIDs,
        },

        orders: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          packed: packedOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },

        revenue: {
          total: totalRevenue,
        },

        pawPoints: {
          credited: totalPointsCredited,
          debited: totalPointsDebited,
          balance: pawPointsBalance,
        },

        recentOrders:
          recentOrders.map((order) => ({
            ...order,
            total: Number(order.total),
          })),

        topProducts,
      },
    });
  } catch (error) {
    console.error(
      "Admin analytics GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not load analytics.",
      },
      {
        status: 500,
      }
    );
  }
}