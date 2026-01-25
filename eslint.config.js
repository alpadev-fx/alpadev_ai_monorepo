// This configuration only applies to the package manager root.
import js from "@eslint/js"

export default [
  {
    ignores: ["apps/**", "packages/**"],
  },
  js.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
  },
]
