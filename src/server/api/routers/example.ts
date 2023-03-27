import { z } from "zod";
import { type UserChangeEvent, domainEvents } from "@/server/domainEvents";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    // get all example documents from mongoDB
    return ctx.prisma.example.findMany();
  }),

  getSecretMessage: protectedProcedure.query(({}) => {
    domainEvents.raise<UserChangeEvent>("user.changed", { userId: "5" });
    return "you can now see this secret message!";
  }),
});
