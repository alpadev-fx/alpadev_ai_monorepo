import { resolve } from "node:path"
import js from "@eslint/js"
import tseslint from "typescript-eslint"
import reactRefresh from "eslint-plugin-react-refresh"
import reactPlugin from "eslint-plugin-react"
import jsxA11y from "eslint-plugin-jsx-a11y"
import importPlugin from "eslint-plugin-import"
import tailwindcss from "eslint-plugin-tailwindcss"
import prettier from "eslint-plugin-prettier"
import reactHooks from "eslint-plugin-react-hooks"
const project = resolve(process.cwd(), "tsconfig.json")

import jsxRules from "./rules/jsxRules.js"

export default [
  // Base config
  {
    ignores: [
      "dist",
      "build",
      "**/*.d.ts",
      "postcss.config.js",
      "tailwind.config.ts",
      "next.config.js",
      "tailwind.config.js",
      "env.mjs",
      "node_modules/",
    ],
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Global settings
  {
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        React: true,
        JSX: true,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project,
        tsconfigRootDir: ".",
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          project,
        },
      },
      react: {
        version: "detect",
      },
    },
    plugins: {
      "react-refresh": reactRefresh,
      import: importPlugin,
      react: reactPlugin,
      "react-hooks": reactHooks,
      prettier: prettier,
      "jsx-a11y": jsxA11y,
      tailwindcss: tailwindcss,
    },
  },
  // All JS/TS files
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "max-lines": ["error", { max: 500, skipComments: true }],
      ...jsxRules,
    },
  },
  // TSX files
  {
    files: ["**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^React$" },
      ],
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/no-import-type-side-effects": "off",
      "jsx-a11y/click-events-have-key-events": "off",
    },
  },
]
