import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "../../../../lib/prisma";

// ====================================================
// VERIFY ADMIN SESSION
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

  // ----------------------------------------------
  // SESSION EXPIRED
  // ----------------------------------------------

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
// GET - ADMIN PRODUCT LIST
// ====================================================

export async function GET() {
  try {
    const admin =
      await getAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login as admin.",
        },
        {
          status: 401,
        }
      );
    }

    const products =
      await prisma.product.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    const formattedProducts =
      products.map((product) => ({
        id: product.id,

        name: product.name,
        brand: product.brand,
        category: product.category,
        packSize: product.packSize,

        mrp: Number(product.mrp),
        price: Number(product.price),

        imageUrl: product.imageUrl,
        description:
          product.description,

        inStock: product.inStock,
        stock: product.stock,

        createdAt:
          product.createdAt,

        updatedAt:
          product.updatedAt,
      }));

    return NextResponse.json({
      success: true,

      admin,

      products:
        formattedProducts,
    });
  } catch (error) {
    console.error(
      "Admin products GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not load products.",
      },
      {
        status: 500,
      }
    );
  }
}

// ====================================================
// POST - CREATE PRODUCT
// ====================================================

export async function POST(
  request: Request
) {
  try {
    const admin =
      await getAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login as admin.",
        },
        {
          status: 401,
        }
      );
    }

    // ----------------------------------------------
    // READ BODY
    // ----------------------------------------------

    const body =
      await request.json();

    const name =
      String(body.name || "").trim();

    const brand =
      String(body.brand || "").trim();

    const category =
      String(
        body.category || ""
      ).trim();

    const packSize =
      String(
        body.packSize || ""
      ).trim();

    const mrp =
      Number(body.mrp);

    const price =
      Number(body.price);

    const stock =
      Number(body.stock);

    const imageUrl =
      String(
        body.imageUrl || ""
      ).trim();

    const description =
      String(
        body.description || ""
      ).trim();

    // ----------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------

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

    if (
      !Number.isFinite(mrp) ||
      mrp <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid MRP.",
        },
        {
          status: 400,
        }
      );
    }

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

    if (
      description.length > 1000
    ) {
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

    // ----------------------------------------------
    // CREATE PRODUCT
    // ----------------------------------------------

    const product =
      await prisma.product.create({
        data: {
          name,
          brand,
          category,
          packSize,

          mrp,
          price,

          imageUrl:
            imageUrl || null,

          description:
            description || null,

          stock,

          // Automatically make unavailable when
          // initial stock is zero.
          inStock:
            stock > 0,
        },
      });

    // ----------------------------------------------
    // RETURN
    // ----------------------------------------------

    return NextResponse.json(
      {
        success: true,

        message:
          "Product created successfully.",

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
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Admin products POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not create product.",
      },
      {
        status: 500,
      }
    );
  }
}