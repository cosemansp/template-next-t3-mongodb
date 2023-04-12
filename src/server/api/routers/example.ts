import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

const getById = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(({ ctx, input }) => {
    return ctx.prisma.example.findUnique({
      where: { id: input.id },
    });
  });

const getAll = publicProcedure.query(async ({ ctx }) => {
  // get all example documents from mongoDB
  const result = await ctx.prisma.example.findMany();
  return result.map((item) => {
    return {
      id: item.id,
      name: item.name,
    };
  });
});

const getSecretMessage = protectedProcedure.query(({}) => {
  return {
    message: "you can now see this secret message!",
  };
});

export const exampleRouter = createTRPCRouter({
  getById,
  getAll,
  getSecretMessage,
});
