import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentCustomer } from "../../../lib/customerAuth";

// ====================================================
// GET - GET CUSTOMER REMINDERS
// ====================================================

export async function GET() {
  try {
    // ----------------------------------------------
    // 1. CHECK SECURE LOGIN SESSION
    // ----------------------------------------------

    const loggedInCustomer =
      await getCurrentCustomer();

    if (!loggedInCustomer) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to view reminders.",
        },
        {
          status: 401,
        }
      );
    }

    const customerId =
      loggedInCustomer.id;

    // ----------------------------------------------
    // 2. GET CUSTOMER INFORMATION
    // ----------------------------------------------

    const customer =
      await prisma.customer.findUnique({
        where: {
          id: customerId,
        },

        select: {
          id: true,
          name: true,
        },
      });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ----------------------------------------------
    // 3. GET CUSTOMER REMINDERS
    // ----------------------------------------------

    const reminders =
      await prisma.reminder.findMany({
        where: {
          customerId,
        },

        include: {
          pet: {
            select: {
              id: true,
              name: true,
              type: true,
              photoUrl: true,
            },
          },
        },

        orderBy: [
          {
            completed: "asc",
          },
          {
            reminderAt: "asc",
          },
        ],
      });

    // ----------------------------------------------
    // 4. RETURN
    // ----------------------------------------------

    return NextResponse.json({
      success: true,

      customer,

      reminders,
    });
  } catch (error) {
    console.error(
      "GET reminders error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Could not load reminders.",
      },
      {
        status: 500,
      }
    );
  }
}

// ====================================================
// POST - CREATE REMINDER
// ====================================================

export async function POST(
  request: Request
) {
  try {
    // ----------------------------------------------
    // 1. CHECK SECURE LOGIN SESSION
    // ----------------------------------------------

    const loggedInCustomer =
      await getCurrentCustomer();

    if (!loggedInCustomer) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login to create a reminder.",
        },
        {
          status: 401,
        }
      );
    }

    const customerId =
      loggedInCustomer.id;

    // ----------------------------------------------
    // 2. READ BODY
    // ----------------------------------------------

    const body =
      await request.json();

    const title =
      String(
        body.title || ""
      ).trim();

    const note =
      String(
        body.note || ""
      ).trim();

    const reminderAtValue =
      String(
        body.reminderAt || ""
      ).trim();

    const petId =
      body.petId === null ||
      body.petId === undefined ||
      body.petId === ""
        ? null
        : Number(body.petId);

    // ----------------------------------------------
    // 3. VALIDATE TITLE
    // ----------------------------------------------

    if (title.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Reminder title must be at least 2 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (title.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Reminder title is too long.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------
    // 4. VALIDATE DATE
    // ----------------------------------------------

    if (!reminderAtValue) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select a reminder date and time.",
        },
        {
          status: 400,
        }
      );
    }

    const reminderAt =
      new Date(reminderAtValue);

    if (
      Number.isNaN(
        reminderAt.getTime()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid reminder date.",
        },
        {
          status: 400,
        }
      );
    }

    // Do not allow reminders in the past.

    if (
      reminderAt.getTime() <=
      Date.now()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Reminder date must be in the future.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------
    // 5. VALIDATE NOTE
    // ----------------------------------------------

    if (note.length > 500) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Reminder note must be 500 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------
    // 6. VALIDATE PET IF SELECTED
    // ----------------------------------------------

    if (petId !== null) {
      if (
        !Number.isInteger(petId) ||
        petId <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid pet selected.",
          },
          {
            status: 400,
          }
        );
      }

      // Security:
      // Selected pet must belong to the
      // currently authenticated customer.

      const pet =
        await prisma.pet.findFirst({
          where: {
            id: petId,
            customerId,
          },

          select: {
            id: true,
          },
        });

      if (!pet) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Pet not found or does not belong to your account.",
          },
          {
            status: 404,
          }
        );
      }
    }

    // ----------------------------------------------
    // 7. CREATE REMINDER
    // ----------------------------------------------

    const reminder =
      await prisma.reminder.create({
        data: {
          customerId,

          petId,

          title,

          reminderAt,

          note:
            note.length > 0
              ? note
              : null,
        },

        include: {
          pet: {
            select: {
              id: true,
              name: true,
              type: true,
              photoUrl: true,
            },
          },
        },
      });

    // ----------------------------------------------
    // 8. RETURN
    // ----------------------------------------------

    return NextResponse.json(
      {
        success: true,

        message:
          "Reminder created successfully.",

        reminder,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST reminder error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not create reminder.",
      },
      {
        status: 500,
      }
    );
  }
}