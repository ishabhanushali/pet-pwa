import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        id: "asc",
      },
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      packSize: product.packSize,

      // Prisma Decimal -> normal number for frontend
      mrp: Number(product.mrp),
      price: Number(product.price),

      image: product.imageUrl ?? "🐾",
      description: product.description ?? "",
      inStock: product.inStock,
      stock: product.stock,
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("GET /api/products error:", error);

    return NextResponse.json(
      {
        error: "Failed to load products",
      },
      {
        status: 500,
      }
    );
  }
}