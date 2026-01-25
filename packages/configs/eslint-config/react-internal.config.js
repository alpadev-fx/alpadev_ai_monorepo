import { resolve } from "node:path"
import js from "@eslint/js"
import tseslint from "typescript-eslint"
import reactPlugin from "eslint-plugin-react"
import reactRefresh from "eslint-plugin-react-refresh"
import tailwindcss from "eslint-plugin-tailwindcss"
import jsxA11y from "eslint-plugin-jsx-a11y"
import importPlugin from "eslint-plugin-import"
import prettier from "eslint-plugin-prettier"

const project = resolve(process.cwd(), "tsconfig.json")
const baseRules = require("./rules/baseRules.js")

export default [
  // Base config
  {
    ignores: [
      // Ignore dotfiles
      ".*.js",
      "node_modules/",
      "dist/",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Global settings
  {
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        project,
      },
      globals: {
        React: true,
        JSX: true,
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
      react: reactPlugin,
      "react-refresh": reactRefresh,
      tailwindcss: tailwindcss,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
      prettier: prettier,
    },
    rules: {
      ...baseRules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
]
