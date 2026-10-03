import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

async function main() {
  const connectionString =
    process.env.DATABASE_URL;

  const name =
    process.env.ADMIN_SETUP_NAME?.trim();

  const email =
    process.env.ADMIN_SETUP_EMAIL
      ?.trim()
      .toLowerCase();

  const password =
    process.env.ADMIN_SETUP_PASSWORD;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not defined."
    );
  }

  if (!name) {
    throw new Error(
      "ADMIN_SETUP_NAME is not defined."
    );
  }

  if (!email) {
    throw new Error(
      "ADMIN_SETUP_EMAIL is not defined."
    );
  }

  if (!password) {
    throw new Error(
      "ADMIN_SETUP_PASSWORD is not defined."
    );
  }

  if (password.length < 12) {
    throw new Error(
      "Admin password must be at least 12 characters."
    );
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  const prisma =
    new PrismaClient({
      adapter,
    });

  try {
    // --------------------------------------------
    // CHECK WHETHER ADMIN ALREADY EXISTS
    // --------------------------------------------

    const existingAdmin =
      await prisma.admin.findUnique({
        where: {
          email,
        },
      });

    if (existingAdmin) {
      console.log(
        `Admin already exists: ${email}`
      );

      return;
    }

    // --------------------------------------------
    // HASH PASSWORD
    // --------------------------------------------

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    // --------------------------------------------
    // CREATE ADMIN
    // --------------------------------------------

    const admin =
      await prisma.admin.create({
        data: {
          name,
          email,
          passwordHash,
          role: "SUPER_ADMIN",
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

    console.log(
      "✅ Admin created successfully."
    );

    console.log({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(
    "❌ Could not create admin:",
    error
  );

  process.exit(1);
});
