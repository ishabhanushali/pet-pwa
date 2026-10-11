
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "crypto";

import { prisma } from "../../../../../lib/prisma";


export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("customerSession")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const session = await prisma.customerSession.findUnique({
      where: { tokenHash },
    });

    if (!session || session.expiresAt.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "Your session has expired." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const petId = Number(id);

    if (!Number.isSafeInteger(petId) || petId <= 0) {
      return NextResponse.json(
        { error: "Invalid pet ID." },
        { status: 400 }
      );
    }

    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        customerId: session.customerId,
      },
      include: {
        petId: true,
      },
    });

    if (!pet) {
      return NextResponse.json(
        { error: "Pet not found." },
        { status: 404 }
      );
    }

    if (!pet.petId) {
      return NextResponse.json(
        { error: "This pet has no Pet ID." },
        { status: 404 }
      );
    }

    if (pet.petId.status === "DISABLED") {
      return NextResponse.json(
        { error: "This Pet ID is already disabled." },
        { status: 409 }
      );
    }

    await prisma.petID.update({
      where: {
        id: pet.petId.id,
      },
      data: {
        status: "DISABLED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pet ID disabled successfully.",
      petCode: pet.petId.petCode,
    });
  } catch (error) {
    console.error("Remove Pet ID error:", error);

    return NextResponse.json(
      { error: "Could not disable Pet ID." },
      { status: 500 }
    );
  }
}
