import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentCustomer } from "../../../../../lib/customerAuth";

// Force this route to run on Node.js.
// The qrcode package uses Node.js functionality.
export const runtime = "nodejs";

// ====================================================
// GET - GENERATE PET QR CODE
// ====================================================

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // ------------------------------------------------
    // 1. CHECK SECURE CUSTOMER SESSION
    // ------------------------------------------------

    const customer =
      await getCurrentCustomer();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login to view this QR code.",
        },
        {
          status: 401,
        }
      );
    }

    const customerId = customer.id;

    // ------------------------------------------------
    // 2. GET PET DATABASE ID FROM URL
    // ------------------------------------------------

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

    // ------------------------------------------------
    // 3. FIND PET
    // ------------------------------------------------
    // Pet must belong to the currently logged-in
    // customer.
    // ------------------------------------------------

    const pet =
      await prisma.pet.findFirst({
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
        {
          status: 404,
        }
      );
    }

    // ------------------------------------------------
    // 4. CHECK PERMANENT PET ID EXISTS
    // ------------------------------------------------

    if (!pet.petId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please issue a permanent Pet ID before generating a QR code.",
        },
        {
          status: 400,
        }
      );
    }

    // ------------------------------------------------
    // 5. CREATE PUBLIC PET URL
    // ------------------------------------------------

    const currentUrl =
      new URL(request.url);

    const publicPetUrl =
      `${currentUrl.origin}/pet/${pet.petId.qrToken}`;

    // Development logging only.
    if (
      process.env.NODE_ENV !==
      "production"
    ) {
      console.log(
        "Generating QR for:",
        pet.petId.petCode
      );

      console.log(
        "QR URL:",
        publicPetUrl
      );
    }

    // ------------------------------------------------
    // 6. GENERATE QR PNG
    // ------------------------------------------------

    const qrBuffer =
      await QRCode.toBuffer(
        publicPetUrl,
        {
          type: "png",
          width: 400,
          margin: 2,
          errorCorrectionLevel: "M",
        }
      );

    // ------------------------------------------------
    // 7. RETURN QR PNG
    // ------------------------------------------------

    return new Response(
      new Uint8Array(qrBuffer),
      {
        status: 200,

        headers: {
          "Content-Type":
            "image/png",

          "Content-Disposition":
            `inline; filename="${pet.petId.petCode}-qr.png"`,

          "Cache-Control":
            "private, no-store, max-age=0",

          "X-Content-Type-Options":
            "nosniff",
        },
      }
    );
  } catch (error) {
    console.error(
      "GET /api/pets/[id]/qr error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not generate QR code.",
      },
      {
        status: 500,
      }
    );
  }
}