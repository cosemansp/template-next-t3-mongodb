/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

console.log("Environment variables loaded from .env");

const prisma = new PrismaClient();

async function seed() {
  const examples = [
    {
      name: "john",
    },
  ];

  try {
    await Promise.all([
      ...examples.map((example) => {
        return prisma.example.create({ data: example });
      }),
    ]);
    console.log("Seeded db successful");
  } catch (err) {
    console.log("Failed to seed database", err);
  }
}

seed();
