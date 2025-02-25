import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: loadEnv("test", process.cwd(), ""),
  },
});
