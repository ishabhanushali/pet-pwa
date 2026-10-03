import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in .env");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const products = [
  {
    name: "Adult Chicken & Rice Dog Food",
    brand: "Happy Paws",
    category: "Dog Food",
    packSize: "3 kg",
    mrp: 999,
    price: 849,
    imageUrl: "🐶",
    description: "Complete everyday nutrition for adult dogs.",
    inStock: true,
    stock: 25,
  },
  {
    name: "Puppy Growth Dog Food",
    brand: "Pet Choice",
    category: "Dog Food",
    packSize: "1.2 kg",
    mrp: 650,
    price: 579,
    imageUrl: "🐕",
    description:
      "Balanced nutrition specially made for growing puppies.",
    inStock: true,
    stock: 20,
  },
  {
    name: "Ocean Fish Cat Food",
    brand: "Meow Meals",
    category: "Cat Food",
    packSize: "1.2 kg",
    mrp: 720,
    price: 649,
    imageUrl: "🐱",
    description: "Tasty ocean fish recipe for adult cats.",
    inStock: true,
    stock: 18,
  },
  {
    name: "Kitten Chicken Food",
    brand: "Whisker Care",
    category: "Cat Food",
    packSize: "800 g",
    mrp: 560,
    price: 499,
    imageUrl: "🐈",
    description: "Protein-rich food developed for kittens.",
    inStock: true,
    stock: 15,
  },
  {
    name: "Chicken Training Treats",
    brand: "Happy Paws",
    category: "Treats",
    packSize: "200 g",
    mrp: 299,
    price: 249,
    imageUrl: "🦴",
    description:
      "Small tasty bites perfect for training and rewards.",
    inStock: true,
    stock: 30,
  },
  {
    name: "Dental Chew Sticks",
    brand: "Pet Choice",
    category: "Treats",
    packSize: "7 sticks",
    mrp: 350,
    price: 299,
    imageUrl: "🍖",
    description: "Chewy treats for rewarding your dog.",
    inStock: false,
    stock: 0,
  },
  {
    name: "Lavender Clumping Cat Litter",
    brand: "Clean Paws",
    category: "Cat Litter",
    packSize: "5 kg",
    mrp: 599,
    price: 529,
    imageUrl: "🐾",
    description: "Fast-clumping litter with odour control.",
    inStock: true,
    stock: 20,
  },
  {
    name: "Natural Unscented Cat Litter",
    brand: "Clean Paws",
    category: "Cat Litter",
    packSize: "5 kg",
    mrp: 549,
    price: 489,
    imageUrl: "🐾",
    description: "Simple unscented litter for everyday use.",
    inStock: true,
    stock: 20,
  },
];

async function main() {
  // Prevent duplicate products if we run the seed again.
  const existingProducts = await prisma.product.count();

  if (existingProducts > 0) {
    console.log(
      `Products already exist (${existingProducts} found). Seed skipped.`
    );
    return;
  }

  await prisma.product.createMany({
    data: products,
  });

  console.log("8 products added successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });