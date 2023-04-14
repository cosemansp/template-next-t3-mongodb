import { PrismaClient } from "@prisma/client";

import { env } from "@/env.mjs";

const prisma = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  datasources: {
    db: {
      url:
        env.NODE_ENV === "test"
          ? "mongodb://localhost:27017/test?directConnection=true"
          : env.DATABASE_URL,
    },
  },
});

export { prisma };
