import { NextResponse } from "next/server";
import { randomBytes, randomUUID } from "crypto";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentCustomer } from "../../../../../lib/customerAuth";

// ====================================================
// POST - ISSUE PERMANENT PET ID
// ====================================================

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
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
            "Please login before issuing a Pet ID.",
        },
        { status: 401 }
      );
    }

    const customerId = customer.id;

    // ------------------------------------------------
    // 2. GET PET ID FROM URL
    // ------------------------------------------------

    const params = await context.params;

    const petId = Number(params.id);

    if (
      !Number.isInteger(petId) ||
      petId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid pet ID.",
        },
        { status: 400 }
      );
    }

    // ------------------------------------------------
    // 3. FIND PET
    // ------------------------------------------------
    //
    // Security:
    // The pet must belong to the logged-in customer.
    // ------------------------------------------------

    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        customerId,
      },

      include: {
        petId: true,
      },
    });

    if (!pet) {
      return NextResponse.json(
        {
          success: false,
          message: "Pet not found.",
        },
        { status: 404 }
      );
    }

    // ------------------------------------------------
    // 4. CHECK WHETHER PET ALREADY HAS AN ID
    // ------------------------------------------------
    //
    // Important:
    // Do NOT create another analytics event here.
    //
    // PET_ID_ISSUED should only be recorded when a
    // brand-new permanent Pet ID is actually created.
    // ------------------------------------------------

    if (pet.petId) {
      return NextResponse.json({
        success: true,

        message:
          "This pet already has a permanent Pet ID.",

        petId: {
          id: pet.petId.id,

          petCode:
            pet.petId.petCode,

          status:
            pet.petId.status,
        },
      });
    }

    // ------------------------------------------------
    // 5. GENERATE UNIQUE TEMPORARY VALUES
    // ------------------------------------------------

    const temporaryCode =
      `TEMP-${randomUUID()}`;

    // Random QR token.
    //
    // No customer/private information is placed
    // inside this token.

    const qrToken =
      randomBytes(32).toString("hex");

    // ------------------------------------------------
    // 6. CREATE PET ID INSIDE TRANSACTION
    // ------------------------------------------------

    const newPetId =
      await prisma.$transaction(
        async (tx) => {
          // ------------------------------------------
          // Create PetID with temporary unique code
          // ------------------------------------------

          const createdPetId =
            await tx.petID.create({
              data: {
                petId: pet.id,

                petCode:
                  temporaryCode,

                qrToken,

                status:
                  "UNCLAIMED",
              },
            });

          // ------------------------------------------
          // 7. GENERATE PERMANENT PET CODE
          // ------------------------------------------
          //
          // Example:
          //
          // Database ID 1   -> P000001
          // Database ID 127 -> P000127
          // ------------------------------------------

          const permanentPetCode =
            `P${String(
              createdPetId.id
            ).padStart(6, "0")}`;

          // ------------------------------------------
          // 8. SAVE PERMANENT CODE
          // ------------------------------------------

          const updatedPetId =
            await tx.petID.update({
              where: {
                id:
                  createdPetId.id,
              },

              data: {
                petCode:
                  permanentPetCode,
              },
            });

          return updatedPetId;
        }
      );

    // ------------------------------------------------
    // 9. RECORD PET ID ISSUED ANALYTICS
    // ------------------------------------------------
    //
    // We are here only after the Pet ID transaction
    // has completed successfully.
    //
    // Analytics failure must NOT make a successfully
    // issued Pet ID appear to have failed.
    // ------------------------------------------------

    try {
      await prisma.analyticsEvent.create({
        data: {
          eventName:
            "PET_ID_ISSUED",

          customerId,

          entityType: "PET",

          entityId: pet.id,

          metadata: {
            petCode:
              newPetId.petCode,

            status:
              newPetId.status,
          },
        },
      });
    } catch (analyticsError) {
      console.error(
        "PET_ID_ISSUED analytics error:",
        analyticsError
      );
    }

    // ------------------------------------------------
    // 10. RETURN SUCCESS
    // ------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        message:
          "Permanent Pet ID issued successfully.",

        petId: {
          id:
            newPetId.id,

          petCode:
            newPetId.petCode,

          status:
            newPetId.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/pets/[id]/issue-id error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Could not issue Pet ID.",
      },
      { status: 500 }
    );
  }
}