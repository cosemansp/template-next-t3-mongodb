/* eslint-disable arrow-body-style */
import react from "@vitejs/plugin-react";
import { join } from "path";
import { defineConfig } from "vite";
// import svgrPlugin from 'vite-plugin-svgr';

const srcRoot = join(__dirname, "src");

// More config, see: https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      // svgrPlugin()
      react(),
    ],
    resolve: {
      alias: {
        "@": srcRoot,
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/tests/setup.ts"],
    },
  };
});
