import { describe, test, expect, beforeEach } from "vitest";
import { appRouter } from "@/server/api/root";
import { createInnerTRPCContext } from "../trpc";
import * as exampleFixtures from "@/tests/fixtures/example";
import { prisma } from "@/server/db";
import { clearDB } from "@/tests/db-utils";

describe("example", () => {
  beforeEach(clearDB);

  test("getById", async () => {
    // arrange
    const mockData = exampleFixtures.single();
    const item = await prisma.example.create({
      data: mockData,
    });

    // act
    const caller = appRouter.createCaller(createInnerTRPCContext({ prisma }));
    const result = await caller.example.getById({ id: item.id });

    // assert
    expect(result).toStrictEqual(item);
  });
});
