/* eslint-disable arrow-body-style */
import react from "@vitejs/plugin-react";
import { join } from "path";
import { defineConfig } from "vite";

const srcRoot = join(__dirname, "src");

export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": srcRoot,
      },
    },
    test: {
      include: ["**/*.test.ts"],
      setupFiles: ["./src/tests/setup.ts"],
    },
  };
});
