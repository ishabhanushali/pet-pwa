import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "../../../../lib/prisma";

// ====================================================
// VERIFY ADMIN SESSION
// ====================================================

async function getAdmin() {
  const cookieStore = await cookies();

  const sessionCookie =
    cookieStore.get("adminSession");

  if (!sessionCookie?.value) {
    return null;
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(sessionCookie.value)
    .digest("hex");

  const session =
    await prisma.adminSession.findUnique({
      where: {
        tokenHash,
      },

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

  // Session expired
  if (
    session.expiresAt.getTime() <=
    Date.now()
  ) {
    await prisma.adminSession.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  return session.admin;
}

// ====================================================
// GET CUSTOMERS + PETS
// ====================================================

export async function GET(
  request: NextRequest
) {
  try {
    // ------------------------------------------------
    // 1. VERIFY ADMIN
    // ------------------------------------------------

    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login as admin.",
        },
        {
          status: 401,
        }
      );
    }

    // ------------------------------------------------
    // 2. GET SEARCH QUERY
    // ------------------------------------------------

    const search =
      request.nextUrl.searchParams
        .get("search")
        ?.trim() || "";

    // ------------------------------------------------
    // 3. GET CUSTOMERS
    // ------------------------------------------------

    const customers =
      await prisma.customer.findMany({
        where: search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },

                {
                  mobile: {
                    contains: search,
                  },
                },

                {
                  email: {
                    contains: search,
                    mode: "insensitive",
                  },
                },

                {
                  pets: {
                    some: {
                      OR: [
                        {
                          name: {
                            contains: search,
                            mode: "insensitive",
                          },
                        },

                        {
                          petId: {
                            petCode: {
                              contains: search,
                              mode: "insensitive",
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            }
          : undefined,

        include: {
          pets: {
            include: {
              petId: true,
            },

            orderBy: {
              createdAt: "desc",
            },
          },

          rewardTransactions: {
            select: {
              type: true,
              points: true,
            },
          },

          addresses: {
            select: {
              id: true,
            },
          },

          orders: {
            select: {
              id: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 100,
      });

    // ------------------------------------------------
    // 4. FORMAT CUSTOMER DATA
    // ------------------------------------------------

    const formattedCustomers =
      customers.map((customer) => {
        // Calculate Paw Points balance
        const pawPoints =
          customer.rewardTransactions.reduce(
            (balance, transaction) => {
              if (
                transaction.type ===
                "CREDIT"
              ) {
                return (
                  balance +
                  transaction.points
                );
              }

              return (
                balance -
                transaction.points
              );
            },
            0
          );

        return {
          id: customer.id,

          name: customer.name,

          mobile:
            customer.mobile,

          email:
            customer.email,

          createdAt:
            customer.createdAt,

          pawPoints,

          orderCount:
            customer.orders.length,

          addressCount:
            customer.addresses.length,

          petCount:
            customer.pets.length,

          pets:
            customer.pets.map(
              (pet) => ({
                id: pet.id,

                name:
                  pet.name,

                type:
                  pet.type,

                breed:
                  pet.breed,

                gender:
                  pet.gender,

                photoUrl:
                  pet.photoUrl,

                createdAt:
                  pet.createdAt,

                petId:
                  pet.petId
                    ? {
                        code:
                          pet.petId.petCode,

                        status:
                          pet.petId.status,

                        activatedAt:
                          pet.petId.activatedAt,
                      }
                    : null,
              })
            ),
        };
      });

    // ------------------------------------------------
    // 5. SUCCESS
    // ------------------------------------------------

    return NextResponse.json({
      success: true,

      admin,

      search,

      count:
        formattedCustomers.length,

      customers:
        formattedCustomers,
    });
  } catch (error) {
    console.error(
      "Admin customers GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Could not load customers.",
      },
      {
        status: 500,
      }
    );
  }
}