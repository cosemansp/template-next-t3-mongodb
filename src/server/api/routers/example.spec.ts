/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/unbound-method */
import { describe, test, expect } from "vitest";
import type { inferProcedureInput } from "@trpc/server";
import { appRouter, type AppRouter } from "@/server/api/root";
import { mockDeep } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";
import { createInnerTRPCContext } from "../trpc";
import * as exampleFixtures from "@/tests/fixtures/example";
import type { Session } from "next-auth";

type Input = inferProcedureInput<AppRouter["example"]["getById"]>;

describe("example", () => {
  test("getById", async () => {
    const prisma = mockDeep<PrismaClient>();
    const mockData = exampleFixtures.single();
    prisma.example.findUnique.mockResolvedValue(mockData);
    const caller = appRouter.createCaller(createInnerTRPCContext({ prisma }));

    const input: Input = { id: mockData.id };
    const result = await caller.example.getById(input);

    expect(prisma.example.findUnique).toHaveBeenCalledWith({
      where: { id: mockData.id },
    });
    expect(result).toStrictEqual(mockData);
  });

  test("getAll", async () => {
    const prisma = mockDeep<PrismaClient>();
    const mockData = exampleFixtures.shortList();
    prisma.example.findMany.mockResolvedValue(mockData);
    const caller = appRouter.createCaller(createInnerTRPCContext({ prisma }));

    const result = await caller.example.getAll();

    expect(prisma.example.findMany).toHaveBeenCalled();
    expect(result).toHaveLength(mockData.length);
    expect(result[0]?.id).toBe(mockData[0]!.id);
    expect(result[0]?.name).toBe(mockData[0]!.name);
  });

  test("getSecret", async () => {
    const session = {
      user: {
        id: "123",
        email: "peter@euri.com",
        roles: ["admin"],
      },
    } as Session;
    const caller = appRouter.createCaller(createInnerTRPCContext({ session }));
    const result = await caller.example.getSecretMessage();
    expect(result).toEqual({
      message: "you can now see this secret message!",
    });
  });
});
