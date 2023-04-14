import { describe, test, expect, vi } from "vitest";
import type { inferProcedureInput } from "@trpc/server";
import { appRouter, type AppRouter } from "@/server/api/root";
import type { DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";
import { createInnerTRPCContext } from "../trpc";
import * as exampleFixtures from "@/tests/fixtures/example";
import type { Session } from "next-auth";
import { prisma } from "@/server/db";

type Input = inferProcedureInput<AppRouter["example"]["getById"]>;

vi.mock("@/server/db");
const prismaMock = <DeepMockProxy<PrismaClient>>prisma;

describe("example", () => {
  test("getById", async () => {
    const mockData = exampleFixtures.single();
    prismaMock.example.findUnique.mockResolvedValue(mockData);
    const caller = appRouter.createCaller(createInnerTRPCContext({ prisma }));

    const input: Input = { id: mockData.id };
    const result = await caller.example.getById(input);

    expect(prismaMock.example.findUnique).toHaveBeenCalledWith({
      where: { id: mockData.id },
    });
    expect(result).toStrictEqual(mockData);
  });

  test("getAll", async () => {
    const mockData = exampleFixtures.shortList();
    prismaMock.example.findMany.mockResolvedValue(mockData);
    const caller = appRouter.createCaller(createInnerTRPCContext({ prisma }));

    const result = await caller.example.getAll();

    expect(prismaMock.example.findMany).toHaveBeenCalled();
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
