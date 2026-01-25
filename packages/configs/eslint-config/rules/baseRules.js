export default {
  "prettier/prettier": ["error"],

  // ---------- Custom Rules ----------
  "no-console": "warn",
  "@typescript-eslint/consistent-type-imports": "warn",
  "@typescript-eslint/no-unnecessary-condition": "error",
  "@typescript-eslint/no-floating-promises": "error",
  "max-params": ["warn", 6],
  "require-await": "off",
  "no-nested-ternary": "off",
  "max-depth": ["error", { max: 4 }],
  "@typescript-eslint/require-await": "error",
  "@typescript-eslint/no-unnecessary-condition": "off",
  // ---------- Custom Rules End ----------

  // ---------- Import & Sorting Rules ----------
  "import/order": [
    "warn",
    {
      groups: [
        "builtin",
        "external",
        "type",
        "internal",
        ["parent", "sibling"],
        "object",
        "index",
      ],
      pathGroups: [
        {
          pattern: "react",
          group: "external",
          position: "before",
        },
      ],
      pathGroupsExcludedImportTypes: ["react"],
      "newlines-between": "always",
      alphabetize: {
        order: "asc",
        caseInsensitive: true,
      },
    },
  ],
  "sort-imports": [
    "warn",
    {
      ignoreCase: true,
      ignoreDeclarationSort: true,
      ignoreMemberSort: false,
      allowSeparatedGroups: true,
    },
  ],
  "import/prefer-default-export": "off",
  "import/no-unresolved": "off",
  "import/no-default-export": "off",
  "import/extensions": [
    "off",
    "always",
    {
      js: "never",
      jsx: "never",
      ts: "never",
      tsx: "never",
    },
  ],
  // ---------- Import & Sorting Rules End ----------
}
