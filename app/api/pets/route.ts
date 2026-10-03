import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentCustomer } from "../../../lib/customerAuth";

// ====================================================
// GET - GET LOGGED-IN CUSTOMER'S PETS
// ====================================================

export async function GET() {
  try {
    // ----------------------------------------------
    // 1. CHECK SECURE LOGIN SESSION
    // ----------------------------------------------

    const customer = await getCurrentCustomer();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to view your pets.",
        },
        { status: 401 }
      );
    }

    const customerId = customer.id;

    // ----------------------------------------------
    // 2. GET PETS FROM DATABASE
    // ----------------------------------------------

    const pets = await prisma.pet.findMany({
      where: {
        customerId,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        petId: true,
      },
    });

    // ----------------------------------------------
    // 3. FORMAT DECIMAL VALUES
    // ----------------------------------------------

    const formattedPets = pets.map((pet) => ({
      id: pet.id,
      name: pet.name,
      type: pet.type,
      photoUrl: pet.photoUrl,
      breed: pet.breed,
      gender: pet.gender,
      dateOfBirth: pet.dateOfBirth,

      weight:
        pet.weight !== null
          ? Number(pet.weight)
          : null,

      allergies: pet.allergies,
      createdAt: pet.createdAt,

      petId: pet.petId
        ? {
            id: pet.petId.id,
            petCode: pet.petId.petCode,
            status: pet.petId.status,

            qrUrl: `/pet/${pet.petId.qrToken}`,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      pets: formattedPets,
    });
  } catch (error) {
    console.error(
      "GET /api/pets error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Could not load your pets.",
      },
      { status: 500 }
    );
  }
}

// ====================================================
// POST - CREATE A NEW PET
// ====================================================

export async function POST(request: Request) {
  try {
    // ----------------------------------------------
    // 1. CHECK SECURE LOGIN SESSION
    // ----------------------------------------------

    const customer = await getCurrentCustomer();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login before adding a pet.",
        },
        { status: 401 }
      );
    }

    const customerId = customer.id;

    // ----------------------------------------------
    // 2. READ FORM DATA
    // ----------------------------------------------

    const body = await request.json();

    const name = String(
      body.name || ""
    ).trim();

    const type = String(
      body.type || ""
    ).trim();

    const breed = String(
      body.breed || ""
    ).trim();

    const gender = String(
      body.gender || ""
    ).trim();

    const allergies = String(
      body.allergies || ""
    ).trim();

    const photoUrl = String(
      body.photoUrl || ""
    ).trim();

    // ----------------------------------------------
    // 3. VALIDATE REQUIRED FIELDS
    // ----------------------------------------------

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pet name must contain at least 2 characters.",
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Pet name is too long.",
        },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a pet type.",
        },
        { status: 400 }
      );
    }

    // Only Dog and Cat for current MVP

    if (
      type !== "Dog" &&
      type !== "Cat"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Pet type must be Dog or Cat.",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------
    // 4. VALIDATE OPTIONAL TEXT FIELDS
    // ----------------------------------------------

    if (breed.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Breed name is too long.",
        },
        { status: 400 }
      );
    }

    if (allergies.length > 500) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Allergy information is too long.",
        },
        { status: 400 }
      );
    }

    if (photoUrl.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message: "Photo URL is too long.",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------
    // 5. VALIDATE GENDER
    // ----------------------------------------------

    if (
      gender &&
      gender !== "Male" &&
      gender !== "Female"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select a valid gender.",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------
    // 6. VALIDATE DATE OF BIRTH
    // ----------------------------------------------

    let dateOfBirth: Date | null = null;

    if (body.dateOfBirth) {
      dateOfBirth =
        new Date(body.dateOfBirth);

      if (
        Number.isNaN(
          dateOfBirth.getTime()
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid date of birth.",
          },
          { status: 400 }
        );
      }

      if (dateOfBirth > new Date()) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Date of birth cannot be in the future.",
          },
          { status: 400 }
        );
      }
    }

    // ----------------------------------------------
    // 7. VALIDATE WEIGHT
    // ----------------------------------------------

    let weight: number | null = null;

    if (
      body.weight !== undefined &&
      body.weight !== null &&
      String(body.weight).trim() !== ""
    ) {
      weight = Number(body.weight);

      if (
        !Number.isFinite(weight) ||
        weight <= 0 ||
        weight > 9999.99
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Please enter a valid pet weight.",
          },
          { status: 400 }
        );
      }
    }

    // ----------------------------------------------
    // 8. CREATE PET
    // ----------------------------------------------

    const pet = await prisma.pet.create({
      data: {
        customerId,

        name,
        type,

        photoUrl:
          photoUrl || null,

        breed:
          breed || null,

        gender:
          gender || null,

        dateOfBirth,

        weight,

        allergies:
          allergies || null,
      },
    });

    // ----------------------------------------------
    // 9. RETURN CREATED PET
    // ----------------------------------------------

    return NextResponse.json(
      {
        success: true,

        message:
          "Pet profile created successfully.",

        pet: {
          id: pet.id,
          name: pet.name,
          type: pet.type,
          photoUrl: pet.photoUrl,
          breed: pet.breed,
          gender: pet.gender,
          dateOfBirth: pet.dateOfBirth,

          weight:
            pet.weight !== null
              ? Number(pet.weight)
              : null,

          allergies:
            pet.allergies,

          createdAt:
            pet.createdAt,

          petId: null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/pets error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not create pet profile.",
      },
      { status: 500 }
    );
  }
}