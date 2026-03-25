// vite.config.js
import { defineConfig } from "vite";
import react            from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    // Vitest config — runs all *.test.js files in src/tests/
    environment: "node",
    include:     ["src/tests/**/*.test.js"],
    reporters:   ["verbose"],   // shows each test name in output
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
});
