import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentCustomer } from "../../../lib/customerAuth";

// ====================================================
// ALLOWED ANALYTICS EVENTS
// ====================================================

const ALLOWED_EVENTS = [
  "PRODUCT_VIEW",
  "ADD_TO_CART",
  "CHECKOUT_STARTED",
  "ORDER_CREATED",
  "PET_ID_ISSUED",
  "PET_ID_ACTIVATED",
  "REORDER",
] as const;

// ====================================================
// POST - RECORD ANALYTICS EVENT
// ====================================================

export async function POST(request: Request) {
  try {
    // ==================================================
    // 1. GET CURRENT CUSTOMER
    // ==================================================
    //
    // Analytics can work for both logged-in and
    // anonymous visitors.
    // ==================================================

    const customer = await getCurrentCustomer();

    // ==================================================
    // 2. READ REQUEST BODY
    // ==================================================

    const body = await request.json();

    const eventName = String(
      body.eventName || ""
    ).trim();

    const entityType = body.entityType
      ? String(body.entityType).trim()
      : null;

    const rawEntityId = body.entityId;

    // ==================================================
    // 3. VALIDATE EVENT NAME
    // ==================================================

    if (
      !ALLOWED_EVENTS.includes(
        eventName as
          (typeof ALLOWED_EVENTS)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid analytics event.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 4. VALIDATE ENTITY TYPE
    // ==================================================

    if (
      entityType &&
      entityType.length > 50
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid analytics entity type.",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // 5. VALIDATE ENTITY ID
    // ==================================================

    let entityId: number | null = null;

    if (
      rawEntityId !== undefined &&
      rawEntityId !== null
    ) {
      entityId = Number(rawEntityId);

      if (
        !Number.isInteger(entityId) ||
        entityId <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid analytics entity ID.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // ==================================================
    // 6. SAFE METADATA
    // ==================================================
    //
    // Only accept a small plain object.
    // Never send OTPs, passwords, mobile numbers,
    // addresses, session tokens, etc. here.
    // ==================================================

    let metadata:
      | Record<string, string | number | boolean | null>
      | undefined;

    if (body.metadata !== undefined) {
      if (
        body.metadata === null ||
        typeof body.metadata !== "object" ||
        Array.isArray(body.metadata)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid analytics metadata.",
          },
          {
            status: 400,
          }
        );
      }

      const entries =
        Object.entries(body.metadata);

      // Prevent very large analytics payloads.
      if (entries.length > 10) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Too much analytics metadata.",
          },
          {
            status: 400,
          }
        );
      }

      metadata = {};

      for (const [key, value] of entries) {
        if (
          key.length === 0 ||
          key.length > 50
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid analytics metadata key.",
            },
            {
              status: 400,
            }
          );
        }

        if (
          value !== null &&
          typeof value !== "string" &&
          typeof value !== "number" &&
          typeof value !== "boolean"
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid analytics metadata value.",
            },
            {
              status: 400,
            }
          );
        }

        if (
          typeof value === "string" &&
          value.length > 200
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Analytics metadata value is too long.",
            },
            {
              status: 400,
            }
          );
        }

        metadata[key] = value;
      }
    }

    // ==================================================
    // 7. CREATE EVENT
    // ==================================================

    const event =
      await prisma.analyticsEvent.create({
        data: {
          eventName,

          customerId:
            customer?.id ?? null,

          entityType:
            entityType || null,

          entityId,

          metadata,
        },
      });

    // ==================================================
    // 8. SUCCESS
    // ==================================================

    return NextResponse.json(
      {
        success: true,
        eventId: event.id,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/analytics error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not record analytics event.",
      },
      {
        status: 500,
      }
    );
  }
}