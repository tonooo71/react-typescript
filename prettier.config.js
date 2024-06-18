/** @type {import("prettier").Config} */
const config = {
  printWidth: 80,
  endOfLine: "auto",

  plugins: ["@trivago/prettier-plugin-sort-imports"],
  importOrder: [
    "@/index.scss", // for src/index.tsx
    "^react(/.*)?$",
    "<THIRD_PARTY_MODULES>",
    "^@/.*(?<!\\.(c|sc)ss)$",
    "^[./].*(?<!\\.(c|sc)ss)$",
    "\\.(c|sc)ss$", // for css
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ["importAssertions", "typescript", "jsx"],
};

export default config;
