import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import eslintPluginUnusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import path from "path";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "url";

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type { import("eslint").Linter.FlatConfig[] } */
export default [
  // .eslintignore
  {
    ignores: ["node_modules/", "dist/"],
  },
  // eslint:recommended
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  // extends: prettier
  eslintConfigPrettier,
  // register plugins
  {
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react: eslintPluginReact,
      "react-hooks": eslintPluginReactHooks,
      "unused-imports": eslintPluginUnusedImports,
    },
    settings: {
      react: {
        version: "18",
      },
    },
  },
  {
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  // typescript file
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: true,
        tsconfigRootDir: "__dirname",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...eslintPluginReact.configs.recommended.rules,
      ...eslintPluginReactHooks.configs.recommended.rules,
      "react/prop-types": 0,
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-undef": "off", // for type
      // not recommended
      // "@typescript-eslint/ban-ts-comment": "off",
      // "@typescript-eslint/no-explicit-any": "off",
      // "react-hooks/exhaustive-deps": "off",
    },
  },
  // mimic ESLintRC-style extends
  ...compat.extends("plugin:@blueprintjs/recommended"),
];
