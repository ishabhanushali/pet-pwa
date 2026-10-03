import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentCustomer } from "../../../../lib/customerAuth";

type CheckoutItem = {
  productId: number;
  quantity: number;
};

export async function POST(request: Request) {
  try {
    // ==================================================
    // 1. CHECK SECURE CUSTOMER SESSION
    // ==================================================

    const customer = await getCurrentCustomer();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login before making payment.",
        },
        {
          status: 401,
        }
      );
    }

    const customerId = customer.id;

    // ==================================================
    // 2. READ REQUEST
    // ==================================================

    const body = await request.json();

    const addressId = Number(body.addressId);

    const items = body.items as CheckoutItem[];

    const simulateSuccess =
      body.simulateSuccess === true;

    // ==================================================
    // 3. VALIDATE ADDRESS ID
    // ==================================================

    if (!Number.isInteger(addressId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a delivery address.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 4. VALIDATE CART
    // ==================================================

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 5. SIMULATED FAILED PAYMENT
    // ==================================================

    if (!simulateSuccess) {
      return NextResponse.json(
        {
          success: false,
          paymentFailed: true,
          message: "Mock payment failed.",
        },
        {
          status: 402,
        }
      );
    }

    // ==================================================
    // 6. VERIFY ADDRESS BELONGS TO CUSTOMER
    // ==================================================

    const address =
      await prisma.address.findFirst({
        where: {
          id: addressId,
          customerId,
        },
      });

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery address not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ==================================================
    // 7. VALIDATE AND COMBINE CART QUANTITIES
    // ==================================================

    const quantities =
      new Map<number, number>();

    for (const item of items) {
      const productId =
        Number(item.productId);

      const quantity =
        Number(item.quantity);

      if (
        !Number.isInteger(productId) ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid cart item.",
          },
          {
            status: 400,
          }
        );
      }

      const currentQuantity =
        quantities.get(productId) || 0;

      const combinedQuantity =
        currentQuantity + quantity;

      if (combinedQuantity > 100) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Maximum quantity is 100 per product.",
          },
          {
            status: 400,
          }
        );
      }

      quantities.set(
        productId,
        combinedQuantity
      );
    }

    const productIds =
      [...quantities.keys()];

    // ==================================================
    // 8. GET REAL PRODUCTS AND PRICES FROM DATABASE
    // ==================================================

    const products =
      await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

    if (
      products.length !==
      productIds.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more products could not be found.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 9. CALCULATE ORDER TOTAL
    // ==================================================

    let subtotal = 0;

    const orderItems: Array<{
      productId: number;
      quantity: number;
      price: (typeof products)[number]["price"];
      mrp: (typeof products)[number]["mrp"];
    }> = [];

    for (const product of products) {
      const quantity =
        quantities.get(product.id)!;

      if (
        !product.inStock ||
        product.stock < quantity
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `${product.name} does not have enough stock.`,
          },
          {
            status: 400,
          }
        );
      }

      subtotal +=
        Number(product.price) *
        quantity;

      orderItems.push({
        productId: product.id,
        quantity,
        price: product.price,
        mrp: product.mrp,
      });
    }

    // ==================================================
    // 10. DELIVERY CHARGE
    // ==================================================

    const deliveryCharge =
      subtotal >= 499
        ? 0
        : 49;

    const total =
      subtotal +
      deliveryCharge;

    // ==================================================
    // 11. CREATE MOCK PAYMENT IDS
    // ==================================================
    //
    // DEVELOPMENT / TESTING ONLY.
    // This is NOT a real payment gateway verification.
    // ==================================================

    const mockPaymentId =
      `mock_pay_${Date.now()}`;

    const mockGatewayOrderId =
      `mock_order_${Date.now()}`;

    const orderNumber =
      "ORD-" +
      Date.now() +
      "-" +
      Math.floor(
        1000 +
          Math.random() * 9000
      );

    // ==================================================
    // 12. CREATE PAID MOCK ORDER
    // ==================================================

    const order =
      await prisma.$transaction(
        async (tx) => {
          const createdOrder =
            await tx.order.create({
              data: {
                orderNumber,

                customerId,

                addressId,

                subtotal,

                deliveryCharge,

                total,

                paymentMethod:
                  "ONLINE",

                paymentStatus:
                  "PAID",

                status:
                  "CONFIRMED",

                paymentGatewayOrderId:
                  mockGatewayOrderId,

                paymentGatewayPaymentId:
                  mockPaymentId,

                items: {
                  create: orderItems,
                },
              },
            });

          // ============================================
          // REDUCE STOCK
          // ============================================

          for (
            const item of orderItems
          ) {
            await tx.product.update({
              where: {
                id: item.productId,
              },

              data: {
                stock: {
                  decrement:
                    item.quantity,
                },
              },
            });
          }

          return createdOrder;
        }
      );

    // ==================================================
    // 13. SUCCESS RESPONSE
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Mock payment successful.",

        payment: {
          paymentId:
            mockPaymentId,

          gatewayOrderId:
            mockGatewayOrderId,
        },

        order: {
          id:
            order.id,

          orderNumber:
            order.orderNumber,

          status:
            order.status,

          paymentMethod:
            order.paymentMethod,

          paymentStatus:
            order.paymentStatus,

          subtotal:
            Number(order.subtotal),

          deliveryCharge:
            Number(
              order.deliveryCharge
            ),

          total:
            Number(order.total),
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/payment/mock error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Mock payment could not be completed.",
      },
      {
        status: 500,
      }
    );
  }
}