import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["netlify/functions/api.ts"],
  format: ["cjs"],
  target: "node18",
  outDir: "netlify/functions",
  clean: false,
  bundle: true,
  sourcemap: true,
});
