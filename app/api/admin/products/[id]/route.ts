import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "../../../../../lib/prisma";

// ====================================================
// VERIFY ADMIN
// ====================================================

async function getAdmin() {
  const cookieStore = await cookies();

  const sessionCookie =
    cookieStore.get("adminSession");

  if (!sessionCookie?.value) {
    return null;
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(sessionCookie.value)
    .digest("hex");

  const session =
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

  if (!session) {
    return null;
  }

  // Check session expiry
  if (
    session.expiresAt.getTime() <=
    Date.now()
  ) {
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
// PUT - UPDATE PRODUCT
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
    // 2. GET PRODUCT ID
    // ------------------------------------------------

    const { id } = await context.params;

    const productId = Number(id);

    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID.",
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------
    // 3. CHECK PRODUCT EXISTS
    // ------------------------------------------------

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ------------------------------------------------
    // 4. READ REQUEST
    // ------------------------------------------------

    const body = await request.json();

    const name =
      String(body.name || "").trim();

    const brand =
      String(body.brand || "").trim();

    const category =
      String(body.category || "").trim();

    const packSize =
      String(body.packSize || "").trim();

    const mrp =
      Number(body.mrp);

    const price =
      Number(body.price);

    const stock =
      Number(body.stock);

    const imageUrl =
      String(body.imageUrl || "").trim();

    const description =
      String(body.description || "").trim();

    const inStock =
      body.inStock === true;

    // ------------------------------------------------
    // 5. VALIDATE TEXT
    // ------------------------------------------------

    if (
      !name ||
      !brand ||
      !category ||
      !packSize
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, brand, category and pack size are required.",
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------
    // 6. VALIDATE MRP
    // ------------------------------------------------

    if (
      !Number.isFinite(mrp) ||
      mrp <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid MRP.",
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------
    // 7. VALIDATE SELLING PRICE
    // ------------------------------------------------

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid selling price.",
        },
        {
          status: 400,
        }
      );
    }

    if (price > mrp) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selling price cannot be greater than MRP.",
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------
    // 8. VALIDATE STOCK
    // ------------------------------------------------

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Stock must be a whole number of 0 or more.",
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------
    // 9. VALIDATE DESCRIPTION
    // ------------------------------------------------

    if (description.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Description must be 1000 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------
    // 10. DETERMINE AVAILABILITY
    // ------------------------------------------------

    // Stock 0 always means unavailable.
    // Otherwise admin controls availability.

    const finalInStock =
      stock > 0 && inStock;

    // ------------------------------------------------
    // 11. UPDATE PRODUCT
    // ------------------------------------------------

    const product =
      await prisma.product.update({
        where: {
          id: productId,
        },

        data: {
          name,
          brand,
          category,
          packSize,

          mrp,
          price,

          stock,

          inStock: finalInStock,

          imageUrl:
            imageUrl || null,

          description:
            description || null,
        },
      });

    // ------------------------------------------------
    // 12. SUCCESS
    // ------------------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Product updated successfully.",

      product: {
        ...product,

        mrp:
          Number(product.mrp),

        price:
          Number(product.price),
      },

      admin: {
        id: admin.id,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error(
      "Admin product update error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not update product.",
      },
      {
        status: 500,
      }
    );
  }
}