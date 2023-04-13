import { describe, test, expect } from "vitest";
import ExampleList from "./ExampleList";
import { render, waitFor, screen } from "@/tests/render";
import { server, trpc } from "@/tests/mockServer";
// import { rest } from "msw";
// import { toTRPCResult } from "@/tests/json-utils";

describe("Example", () => {
  test("works", async () => {
    server.resetHandlers(
      trpc.example.getById.query((req, res, ctx) => {
        return res(ctx.data({ id: 1, name: "test" }));
      })
      // rest.all("*/trpc/example.getById", (req, res, ctx) => {
      //   return res(ctx.json(toTRPCResult({ id: 1, name: "test" })));
      // })
    );
    render(<ExampleList />);

    const element = screen.getByText("Loading...");
    expect(element).toBeInTheDocument();

    await waitFor(() => {
      const element = screen.getByText("id: 1");
      expect(element).toBeInTheDocument();
    });
  });
});
