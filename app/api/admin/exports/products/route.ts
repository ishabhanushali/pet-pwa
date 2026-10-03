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
  value:
    | string
    | number
    | boolean
    | null
    | undefined
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

    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const rows: string[] = [];

    rows.push(
      [
        "Product ID",
        "Name",
        "Brand",
        "Category",
        "Pack Size",
        "MRP",
        "Selling Price",
        "Stock",
        "Available",
        "Description",
        "Image URL",
        "Created At",
        "Updated At",
      ]
        .map(csvValue)
        .join(",")
    );

    for (const product of products) {
      rows.push(
        [
          product.id,
          product.name,
          product.brand,
          product.category,
          product.packSize,
          Number(product.mrp),
          Number(product.price),
          product.stock,
          product.inStock,
          product.description ?? "",
          product.imageUrl ?? "",
          product.createdAt.toISOString(),
          product.updatedAt.toISOString(),
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
          'attachment; filename="pet-pwa-products.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Products CSV export error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not export products.",
      },
      { status: 500 }
    );
  }
}