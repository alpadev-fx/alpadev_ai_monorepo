import { resolve } from "node:path"
import js from "@eslint/js"
import onlyWarn from "eslint-plugin-only-warn"

const project = resolve(process.cwd(), "tsconfig.json")

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
  // Global settings
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        React: true,
        JSX: true,
      },
      parserOptions: {
        project,
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
      "only-warn": onlyWarn,
    },
  },
  // JS/TS files
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    rules: {},
  },
]
