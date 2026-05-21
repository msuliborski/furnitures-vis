import * as esbuild from "esbuild";
import { fileURLToPath } from "url";
import path from "path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const outJs = path.join(dir, "static", "app.js");

await esbuild.build({
  entryPoints: [path.join(dir, "build-entry.jsx")],
  bundle: true,
  minify: true,
  format: "iife",
  outfile: outJs,
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
});

console.log("Wrote", outJs);
