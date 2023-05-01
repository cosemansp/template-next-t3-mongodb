import { setupServer } from "msw/node";
import { createTRPCMsw } from "msw-trpc";
import { type AppRouter } from "@/server/api/root";
import superjson from "superjson";

export const server = setupServer();

export const trpc = createTRPCMsw<AppRouter>({
  transformer: {
    input: superjson,
    output: superjson,
  },
});
