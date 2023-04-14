import { prisma } from "@/server/db";

export const clearDB = async () => {
  await prisma.$transaction([
    prisma.example.deleteMany(),
    // add others here
  ]);
};
