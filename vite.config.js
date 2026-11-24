import { defineConfig } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const pages = ["index", "courses", "course", "enroll"];

export default defineConfig({
  base: "./",
  server: { port: 5173, open: true },
  preview: { port: 4173 },
  root: ".",
  build: {
    outDir: "dist",
    sourcemap: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: Object.fromEntries(pages.map((name) => [name, resolve(root, `${name}.html`)]))
    }
  }
});
