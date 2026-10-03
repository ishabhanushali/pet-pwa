import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentCustomer } from "../../../../../lib/customerAuth";

// ====================================================
// POST - ACTIVATE PET ID
// ====================================================

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // ==================================================
    // 1. CHECK SECURE CUSTOMER SESSION
    // ==================================================

    const customer =
      await getCurrentCustomer();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login before activating this Pet ID.",
        },
        {
          status: 401,
        }
      );
    }

    // ==================================================
    // 2. GET PET DATABASE ID
    // ==================================================

    const { id } = await context.params;

    const petId = Number(id);

    if (
      !Number.isInteger(petId) ||
      petId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid pet ID.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 3. READ AND VALIDATE OTP
    // ==================================================

    const body = await request.json();

    const otp = String(
      body.otp || ""
    ).trim();

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid 6-digit OTP.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 4. FIND CUSTOMER'S PET
    // ==================================================

    const pet =
      await prisma.pet.findFirst({
        where: {
          id: petId,
          customerId: customer.id,
        },

        include: {
          petId: true,
        },
      });

    if (!pet) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pet not found or you do not own this pet.",
        },
        {
          status: 404,
        }
      );
    }

    // ==================================================
    // 5. CHECK PERMANENT PET ID EXISTS
    // ==================================================

    if (!pet.petId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This pet does not have a permanent Pet ID yet.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 6. CHECK PET ID STATUS
    // ==================================================
    //
    // Important:
    // If already ACTIVE, simply return success.
    // Do NOT create another PET_ID_ACTIVATED event.
    // ==================================================

    if (pet.petId.status === "ACTIVE") {
      return NextResponse.json({
        success: true,

        message:
          "This Pet ID is already active.",

        petId: {
          id:
            pet.petId.id,

          petCode:
            pet.petId.petCode,

          status:
            pet.petId.status,

          activatedAt:
            pet.petId.activatedAt,
        },
      });
    }

    if (
      pet.petId.status ===
      "DISABLED"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This Pet ID is disabled and cannot be activated.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      pet.petId.status !==
      "UNCLAIMED"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This Pet ID cannot currently be activated.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 7. FIND ACTIVATION OTP
    // ==================================================

    const otpRecord =
      await prisma.petActivationOTP.findFirst({
        where: {
          petId,
          mobile:
            customer.mobile,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Activation OTP not found. Please request a new OTP.",
        },
        {
          status: 401,
        }
      );
    }

    // ==================================================
    // 8. CHECK OTP EXPIRY
    // ==================================================

    if (
      otpRecord.expiresAt.getTime() <=
      Date.now()
    ) {
      await prisma.petActivationOTP.deleteMany({
        where: {
          petId,

          mobile:
            customer.mobile,
        },
      });

      return NextResponse.json(
        {
          success: false,

          message:
            "Activation OTP has expired. Please request a new OTP.",
        },
        {
          status: 401,
        }
      );
    }

    // ==================================================
    // 9. CHECK ATTEMPT LIMIT
    // ==================================================

    if (otpRecord.attempts >= 5) {
      await prisma.petActivationOTP.deleteMany({
        where: {
          petId,

          mobile:
            customer.mobile,
        },
      });

      return NextResponse.json(
        {
          success: false,

          message:
            "Too many incorrect attempts. Please request a new OTP.",
        },
        {
          status: 429,
        }
      );
    }

    // ==================================================
    // 10. HASH ENTERED OTP
    // ==================================================

    const enteredOtpHash =
      crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    // ==================================================
    // 11. VERIFY OTP
    // ==================================================

    if (
      enteredOtpHash !==
      otpRecord.otpHash
    ) {
      const updatedOtp =
        await prisma.petActivationOTP.update({
          where: {
            id: otpRecord.id,
          },

          data: {
            attempts: {
              increment: 1,
            },
          },
        });

      const attemptsLeft =
        Math.max(
          0,
          5 - updatedOtp.attempts
        );

      // Delete the OTP immediately once
      // all attempts have been used.

      if (attemptsLeft === 0) {
        await prisma.petActivationOTP.deleteMany({
          where: {
            petId,

            mobile:
              customer.mobile,
          },
        });
      }

      return NextResponse.json(
        {
          success: false,

          message:
            attemptsLeft > 0
              ? `Incorrect OTP. ${attemptsLeft} attempt(s) remaining.`
              : "Too many incorrect attempts. Please request a new OTP.",
        },
        {
          status:
            attemptsLeft > 0
              ? 401
              : 429,
        }
      );
    }

    // ==================================================
    // 12. ACTIVATE PET ID + CONSUME OTP
    // ==================================================
    //
    // Both operations happen in one database
    // transaction.
    // ==================================================

    const activatedPetId =
      await prisma.$transaction(
        async (tx) => {
          const activated =
            await tx.petID.update({
              where: {
                id:
                  pet.petId!.id,
              },

              data: {
                status:
                  "ACTIVE",

                activatedAt:
                  new Date(),
              },
            });

          // OTP is single-use.

          await tx.petActivationOTP.deleteMany({
            where: {
              petId,

              mobile:
                customer.mobile,
            },
          });

          return activated;
        }
      );

    // ==================================================
    // 13. RECORD PET ID ACTIVATED ANALYTICS
    // ==================================================
    //
    // We only reach here after:
    //
    // 1. Customer authentication succeeded
    // 2. Pet ownership was verified
    // 3. OTP was verified
    // 4. Pet ID became ACTIVE
    //
    // Analytics failure must NOT make a successfully
    // activated Pet ID appear to have failed.
    // ==================================================

    try {
      await prisma.analyticsEvent.create({
        data: {
          eventName:
            "PET_ID_ACTIVATED",

          customerId:
            customer.id,

          entityType:
            "PET",

          entityId:
            pet.id,

          metadata: {
            petCode:
              activatedPetId.petCode,

            status:
              activatedPetId.status,
          },
        },
      });
    } catch (analyticsError) {
      console.error(
        "PET_ID_ACTIVATED analytics error:",
        analyticsError
      );
    }

    // ==================================================
    // 14. RETURN SUCCESS
    // ==================================================

    return NextResponse.json({
      success: true,

      message:
        "Pet ID activated successfully.",

      petId: {
        id:
          activatedPetId.id,

        petCode:
          activatedPetId.petCode,

        status:
          activatedPetId.status,

        activatedAt:
          activatedPetId.activatedAt,
      },
    });
  } catch (error) {
    console.error(
      "POST /api/pets/[id]/activate error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Could not activate Pet ID.",
      },
      {
        status: 500,
      }
    );
  }
}