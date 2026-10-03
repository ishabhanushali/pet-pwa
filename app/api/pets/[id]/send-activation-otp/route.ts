import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentCustomer } from "../../../../../lib/customerAuth";

// ====================================================
// POST - SEND PET ACTIVATION OTP
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
            "Please login before requesting an activation OTP.",
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
    // 3. FIND CUSTOMER'S PET
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
    // 4. CHECK PERMANENT PET ID
    // ==================================================

    if (!pet.petId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please issue a permanent Pet ID first.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 5. CHECK PET ID STATUS
    // ==================================================

    if (pet.petId.status === "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This Pet ID is already active.",
        },
        {
          status: 400,
        }
      );
    }

    if (pet.petId.status === "DISABLED") {
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

    if (pet.petId.status !== "UNCLAIMED") {
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
    // 6. CHECK 60-SECOND RESEND COOLDOWN
    // ==================================================

    const existingOtp =
      await prisma.petActivationOTP.findFirst({
        where: {
          petId,
          mobile: customer.mobile,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    if (existingOtp) {
      const age =
        Date.now() -
        existingOtp.createdAt.getTime();

      const cooldown =
        60 * 1000;

      if (age < cooldown) {
        const secondsRemaining =
          Math.ceil(
            (cooldown - age) / 1000
          );

        return NextResponse.json(
          {
            success: false,

            message:
              `Please wait ${secondsRemaining} second(s) before requesting another OTP.`,

            retryAfter:
              secondsRemaining,
          },
          {
            status: 429,

            headers: {
              "Retry-After":
                String(secondsRemaining),
            },
          }
        );
      }
    }

    // ==================================================
    // 7. GENERATE RANDOM 6-DIGIT OTP
    // ==================================================

    const otp = crypto
      .randomInt(
        100000,
        1000000
      )
      .toString();

    // ==================================================
    // 8. HASH OTP
    // ==================================================

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // ==================================================
    // 9. OTP EXPIRES AFTER 5 MINUTES
    // ==================================================

    const expiresAt =
      new Date(
        Date.now() +
          5 * 60 * 1000
      );

    // ==================================================
    // 10. DELETE OLD ACTIVATION OTPs
    // ==================================================

    await prisma.petActivationOTP.deleteMany({
      where: {
        petId,
        mobile: customer.mobile,
      },
    });

    // ==================================================
    // 11. STORE NEW OTP HASH
    // ==================================================

    await prisma.petActivationOTP.create({
      data: {
        petId,
        mobile: customer.mobile,
        otpHash,
        attempts: 0,
        expiresAt,
      },
    });

    // ==================================================
    // 12. DEVELOPMENT MODE
    // ==================================================
    //
    // During development only, return the OTP so we
    // can test without an SMS provider.
    // ==================================================

    if (
      process.env.NODE_ENV !==
      "production"
    ) {
      console.log(
        `Development Pet Activation OTP for ${customer.mobile}: ${otp}`
      );

      return NextResponse.json({
        success: true,

        message:
          "Activation OTP generated successfully.",

        demoOtp: otp,
      });
    }

    // ==================================================
    // 13. PRODUCTION RESPONSE
    // ==================================================
    //
    // Before production, send this OTP through the
    // configured SMS provider.
    // ==================================================

    return NextResponse.json({
      success: true,
      message:
        "Activation OTP sent successfully.",
    });
  } catch (error) {
    console.error(
      "POST /api/pets/[id]/send-activation-otp error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not generate activation OTP.",
      },
      {
        status: 500,
      }
    );
  }
}