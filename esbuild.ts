import path from "path";

import linaria from "@linaria/esbuild";
import { build } from "esbuild";

const production = process.env.NODE_ENV === "production";

!production && console.log("http://localhost:3000");

build({
  // Simple options
  bundle: true,
  define: {
    "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`,
  },
  entryPoints: [path.resolve(__dirname, "src/index.tsx")],
  metafile: production,
  minify: production,
  outdir: path.resolve(__dirname, "dist"),
  platform: "browser",
  sourcemap: !production,
  target: "es2020",
  watch: !production,
  // Advanced options
  legalComments: "none",
  logLevel: "info",
  resolveExtensions: [".js", ".ts", ".tsx", ".json", ".mjs", ".wasm"],
  treeShaking: true,
  tsconfig: path.resolve(__dirname, "tsconfig.json"),
  // Plugins
  plugins: [
    // @ts-ignore: 型ファイルの競合のため
    linaria({ sourceMap: !production }),
  ],
});
