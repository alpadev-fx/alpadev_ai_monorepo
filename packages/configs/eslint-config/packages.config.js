import { resolve } from "node:path"
import js from "@eslint/js"
import tseslint from "typescript-eslint"
import reactRefresh from "eslint-plugin-react-refresh"
import importPlugin from "eslint-plugin-import"
import prettier from "eslint-plugin-prettier"

const project = resolve(process.cwd(), "tsconfig.json")
import baseRules from "./rules/baseRules.js"

export default [
  // Base config
  {
    ignores: ["dist", "build", "node_modules", "**/*.d.ts", "**/*.md"],
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
    },
    plugins: {
      "react-refresh": reactRefresh,
      import: importPlugin,
      prettier: prettier,
    },
    rules: {
      ...baseRules,
      "prettier/prettier": ["error"],
      "react-refresh/only-export-components": ["off"],
      "@typescript-eslint/no-var-requires": "error",
      "import/no-duplicates": ["warn"],
    },
  },
  // Match .ts and .tsx files
  {
    files: ["**/*.ts?(x)"],
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "no-void": ["error", { allowAsStatement: true }],
    },
  },
]
