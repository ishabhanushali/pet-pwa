import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

// ====================================================
// GET - PUBLIC PET INFORMATION FROM QR TOKEN
// ====================================================

export async function GET(
  request: Request,
  context: {
    params: Promise<{ token: string }>;
  }
) {
  try {
    // ------------------------------------------------
    // 1. GET TOKEN FROM URL
    // ------------------------------------------------

    const { token } = await context.params;

    if (!token || token.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Pet ID link.",
        },
        { status: 400 }
      );
    }

    // ------------------------------------------------
    // 2. FIND PET ID USING QR TOKEN
    // ------------------------------------------------

    const petIdRecord = await prisma.petID.findUnique({
      where: {
        qrToken: token,
      },

      include: {
        pet: true,
      },
    });

    if (!petIdRecord) {
      return NextResponse.json(
        {
          success: false,
          message: "Pet ID not found.",
        },
        { status: 404 }
      );
    }

    // ------------------------------------------------
    // 3. BLOCK DISABLED PET IDs
    // ------------------------------------------------

    if (petIdRecord.status === "DISABLED") {
      return NextResponse.json(
        {
          success: false,
          message: "This Pet ID is currently disabled.",
        },
        { status: 403 }
      );
    }

    const pet = petIdRecord.pet;

    // ------------------------------------------------
    // 4. RETURN ONLY PUBLIC INFORMATION
    // ------------------------------------------------
    //
    // IMPORTANT:
    // Do NOT return:
    //
    // customerId
    // customer mobile
    // customer email
    // customer address
    // qrToken
    //
    // This endpoint is public.

    return NextResponse.json({
      success: true,

      pet: {
        name: pet.name,

        type: pet.type,

        photoUrl: pet.photoUrl,

        breed: pet.breed,

        gender: pet.gender,

        petCode: petIdRecord.petCode,

        status: petIdRecord.status,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/public/pet/[token] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Could not load Pet ID.",
      },
      { status: 500 }
    );
  }
}