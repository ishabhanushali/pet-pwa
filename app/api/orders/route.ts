import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentCustomer } from "../../../lib/customerAuth";

type CheckoutItem = {
  productId: number;
  quantity: number;
};

// ====================================================
// POST - CREATE CASH ON DELIVERY ORDER
// ====================================================

export async function POST(request: Request) {
  try {
    // ------------------------------------------------
    // 1. CHECK SECURE LOGIN SESSION
    // ------------------------------------------------

    const customer = await getCurrentCustomer();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login before placing an order.",
        },
        { status: 401 }
      );
    }

    const customerId = customer.id;

    // ------------------------------------------------
    // 2. READ CHECKOUT DATA
    // ------------------------------------------------

    const body = await request.json();

    const addressId = Number(body.addressId);

    const paymentMethod = String(
      body.paymentMethod || ""
    );

    const items = body.items as CheckoutItem[];

    // ------------------------------------------------
    // 3. VALIDATE ADDRESS
    // ------------------------------------------------

    if (!Number.isInteger(addressId)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select a delivery address.",
        },
        { status: 400 }
      );
    }

    // ------------------------------------------------
    // 4. COD ONLY
    // ------------------------------------------------
    //
    // Online payments use /api/payment/mock instead.
    // ------------------------------------------------

    if (paymentMethod !== "COD") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Online payments must be completed before creating the order.",
        },
        { status: 400 }
      );
    }

    // ------------------------------------------------
    // 5. VALIDATE CART
    // ------------------------------------------------

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty.",
        },
        { status: 400 }
      );
    }

    // ------------------------------------------------
    // 6. CHECK ADDRESS BELONGS TO CUSTOMER
    // ------------------------------------------------

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
          message:
            "Delivery address not found.",
        },
        { status: 404 }
      );
    }

    // ------------------------------------------------
    // 7. VALIDATE PRODUCT IDs + QUANTITIES
    // ------------------------------------------------

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
            message:
              "Invalid cart item.",
          },
          { status: 400 }
        );
      }

      // Safety limit for one product
      // in one order.

      if (quantity > 100) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Product quantity is too large.",
          },
          { status: 400 }
        );
      }

      // If the same product appears
      // multiple times, combine quantity.

      quantities.set(
        productId,
        (quantities.get(productId) || 0) +
          quantity
      );
    }

    // Check combined quantities too.

    for (
      const quantity of quantities.values()
    ) {
      if (quantity > 100) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Product quantity is too large.",
          },
          { status: 400 }
        );
      }
    }

    const productIds = [
      ...quantities.keys(),
    ];

    // ------------------------------------------------
    // 8. GET REAL PRODUCTS FROM DATABASE
    // ------------------------------------------------
    //
    // Never trust prices sent by browser.
    // ------------------------------------------------

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
        { status: 400 }
      );
    }

    // ------------------------------------------------
    // 9. CALCULATE REAL TOTAL
    // ------------------------------------------------

    let subtotal = 0;

    const orderItems: {
      productId: number;
      quantity: number;
      price: (typeof products)[number]["price"];
      mrp: (typeof products)[number]["mrp"];
    }[] = [];

    for (const product of products) {
      const quantity =
        quantities.get(product.id)!;

      // Check availability.

      if (!product.inStock) {
        return NextResponse.json(
          {
            success: false,
            message:
              `${product.name} is currently out of stock.`,
          },
          { status: 400 }
        );
      }

      // Check available stock.

      if (product.stock < quantity) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Only ${product.stock} unit(s) of ${product.name} are available.`,
          },
          { status: 400 }
        );
      }

      const price =
        Number(product.price);

      subtotal +=
        price * quantity;

      orderItems.push({
        productId: product.id,
        quantity,
        price: product.price,
        mrp: product.mrp,
      });
    }

    // ------------------------------------------------
    // 10. DELIVERY CHARGE
    // ------------------------------------------------

    const deliveryCharge =
      subtotal >= 499 ? 0 : 49;

    const total =
      subtotal + deliveryCharge;

    // ------------------------------------------------
    // 11. GENERATE ORDER NUMBER
    // ------------------------------------------------

    const orderNumber =
      "ORD-" +
      Date.now() +
      "-" +
      Math.floor(
        1000 + Math.random() * 9000
      );

    // ------------------------------------------------
    // 12. CREATE ORDER + ORDER ITEMS
    // ------------------------------------------------

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

                paymentMethod: "COD",

                // COD has not been paid yet.

                paymentStatus:
                  "PENDING",

                // Admin confirms/processes
                // the order later.

                status: "PENDING",

                items: {
                  create: orderItems,
                },
              },

              include: {
                items: true,
                address: true,
              },
            });

          // --------------------------------------------
          // REDUCE PRODUCT STOCK
          // --------------------------------------------

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

    // ------------------------------------------------
    // 13. RECORD ORDER ANALYTICS
    // ------------------------------------------------
    //
    // The order transaction has completed
    // successfully before we reach this point.
    //
    // Analytics failure must NOT make a successfully
    // created order appear to have failed.
    // ------------------------------------------------

    try {
      const itemCount =
        orderItems.reduce(
          (sum, item) =>
            sum + item.quantity,
          0
        );

      await prisma.analyticsEvent.create({
        data: {
          eventName:
            "ORDER_CREATED",

          customerId,

          entityType: "ORDER",

          entityId: order.id,

          metadata: {
            paymentMethod: "COD",
            itemCount,

            subtotal: Number(
              order.subtotal
            ),

            deliveryCharge: Number(
              order.deliveryCharge
            ),

            total: Number(
              order.total
            ),
          },
        },
      });
    } catch (analyticsError) {
      console.error(
        "ORDER_CREATED analytics error:",
        analyticsError
      );
    }

    // ------------------------------------------------
    // 14. RETURN SUCCESS
    // ------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        message:
          "Order placed successfully.",

        order: {
          id: order.id,

          orderNumber:
            order.orderNumber,

          subtotal:
            Number(order.subtotal),

          deliveryCharge:
            Number(
              order.deliveryCharge
            ),

          total:
            Number(order.total),

          status:
            order.status,

          paymentMethod:
            order.paymentMethod,

          paymentStatus:
            order.paymentStatus,

          createdAt:
            order.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/orders error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not place order.",
      },
      { status: 500 }
    );
  }
}

// ====================================================
// GET - LOGGED-IN CUSTOMER'S ORDER HISTORY
// ====================================================

export async function GET() {
  try {
    // ------------------------------------------------
    // 1. CHECK SECURE LOGIN SESSION
    // ------------------------------------------------

    const customer =
      await getCurrentCustomer();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login to view your orders.",
        },
        { status: 401 }
      );
    }

    const customerId =
      customer.id;

    // ------------------------------------------------
    // 2. GET CUSTOMER'S ORDERS
    // ------------------------------------------------

    const orders =
      await prisma.order.findMany({
        where: {
          customerId,
        },

        // Newest order first.

        orderBy: {
          createdAt: "desc",
        },

        include: {
          address: true,

          items: {
            include: {
              product: true,
            },
          },
        },
      });

    // ------------------------------------------------
    // 3. FORMAT PRISMA DECIMAL VALUES
    // ------------------------------------------------

    const formattedOrders =
      orders.map((order) => ({
        id: order.id,

        orderNumber:
          order.orderNumber,

        subtotal:
          Number(order.subtotal),

        deliveryCharge:
          Number(
            order.deliveryCharge
          ),

        total:
          Number(order.total),

        status:
          order.status,

        paymentMethod:
          order.paymentMethod,

        paymentStatus:
          order.paymentStatus,

        createdAt:
          order.createdAt,

        // --------------------------------------------
        // DELIVERY ADDRESS
        // --------------------------------------------

        address: {
          id:
            order.address.id,

          address:
            order.address.address,

          landmark:
            order.address.landmark,

          city:
            order.address.city,

          state:
            order.address.state,

          pincode:
            order.address.pincode,
        },

        // --------------------------------------------
        // ORDER PRODUCTS
        // --------------------------------------------

        items: order.items.map(
          (item) => ({
            id:
              item.id,

            quantity:
              item.quantity,

            price:
              Number(item.price),

            mrp:
              Number(item.mrp),

            product: {
              id:
                item.product.id,

              name:
                item.product.name,

              brand:
                item.product.brand,

              category:
                item.product.category,

              packSize:
                item.product.packSize,

              image:
                item.product
                  .imageUrl ?? "🐾",
            },
          })
        ),
      }));

    // ------------------------------------------------
    // 4. RETURN ORDER HISTORY
    // ------------------------------------------------

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error(
      "GET /api/orders error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not load your orders.",
      },
      { status: 500 }
    );
  }
}