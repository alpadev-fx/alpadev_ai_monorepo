import baseRules from "./baseRules.js"

export default {
  ...baseRules,
  // ---------- React & JSX Rules ----------
  "react/jsx-max-depth": ["error", { max: 8 }],
  "react/self-closing-comp": [
    "error",
    {
      component: true,
      html: true,
    },
  ],
  "react/jsx-sort-props": [
    "warn",
    {
      callbacksLast: true,
      shorthandFirst: true,
      shorthandLast: false,
      multiline: "last",
      ignoreCase: true,
      noSortAlphabetically: false,
      reservedFirst: true,
    },
  ],
  "tailwindcss/no-custom-classname": "off",
  // ---------- Next.js Rules ----------
  "@next/next/no-img-element": "off",
  "@next/next/no-html-link-for-pages": "off",
  // ---------- React Specific Rules ----------
  "react/react-in-jsx-scope": "off",
  "jsx-a11y/anchor-is-valid": "warn",
  "react-hooks/rules-of-hooks": "warn",
  "react-hooks/exhaustive-deps": "warn",
  "react/function-component-definition": "error",
  "react/destructuring-assignment": ["error", "always"],
  // ---------- TypeScript Naming Conventions ----------
  "@typescript-eslint/naming-convention": [
    "error",
    {
      selector: ["variable", "function"],
      types: ["function"],
      format: ["camelCase", "PascalCase"],
      leadingUnderscore: "forbid",
    },
    {
      selector: "variable",
      types: ["boolean", "number", "string", "array"],
      format: ["camelCase", "UPPER_CASE"],
      leadingUnderscore: "forbid",
    },
    {
      selector: "typeLike",
      format: ["PascalCase"],
      leadingUnderscore: "forbid",
    },
    {
      selector: "typeLike",
      format: ["PascalCase"],
      leadingUnderscore: "forbid",
    },
    {
      selector: "class",
      format: ["PascalCase"],
      leadingUnderscore: "forbid",
    },
    {
      selector: "classMethod",
      format: ["camelCase"],
      leadingUnderscore: "allow",
    },
  ],
}
