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

    const pets = await prisma.pet.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            mobile: true,
            email: true,
          },
        },

        petId: {
          select: {
            petCode: true,
            status: true,
            activatedAt: true,
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
        "Pet Database ID",
        "Pet ID",
        "Pet ID Status",
        "Pet Name",
        "Type",
        "Breed",
        "Gender",
        "Date of Birth",
        "Weight",
        "Allergies",
        "Customer ID",
        "Owner Name",
        "Owner Mobile",
        "Owner Email",
        "Pet ID Activated At",
        "Created At",
      ]
        .map(csvValue)
        .join(",")
    );

    for (const pet of pets) {
      rows.push(
        [
          pet.id,
          pet.petId?.petCode ?? "",
          pet.petId?.status ?? "",
          pet.name,
          pet.type,
          pet.breed ?? "",
          pet.gender ?? "",
          pet.dateOfBirth
            ? pet.dateOfBirth.toISOString()
            : "",
          pet.weight !== null
            ? Number(pet.weight)
            : "",
          pet.allergies ?? "",
          pet.customer.id,
          pet.customer.name,
          pet.customer.mobile,
          pet.customer.email ?? "",
          pet.petId?.activatedAt
            ? pet.petId.activatedAt.toISOString()
            : "",
          pet.createdAt.toISOString(),
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
          'attachment; filename="pet-pwa-pets.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Pets CSV export error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not export pets.",
      },
      { status: 500 }
    );
  }
}