// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import matchers from "@testing-library/jest-dom/matchers";
import { afterAll, afterEach, beforeAll, expect } from "vitest";
import { server } from "./msw";
import { cleanup } from "./test-utils";

expect.extend(matchers);

beforeAll(() => {
  server.listen({
    onUnhandledRequest: "error",
  });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
