import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/tests/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    env: {
      DATABASE_URL: "postgresql://mock-user:mock-pass@127.0.0.1:5432/mock_test_db",
    },
  },
});