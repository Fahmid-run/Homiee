import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  target: "esnext",
  outDir: "dist",
  clean: true,
  bundle: true,
  splitting: false,
  sourcemap: true,
  banner: {
    // Shim required for Node/Express CJS dependencies bundled in ESM
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
});
