import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Allow inline styles where dynamically calculated (e.g., progress bars)
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-before-interactive-script-outside-document": "off",
      "react/no-unknown-property": "off",
      "@next/next/google-font-display": "off",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react/display-name": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-style-component-with-global-styles": "off",
      "react/style-prop-object": "off",
      "@next/next/no-inline-styles": "off",
      "style-prop-object": "off",
      "inline-styles": "off",
    },
  },
  {
    files: ["**/*.tsx", "**/*.ts"],
    rules: {
      "react/style-prop-object": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    ".git/**",
    "coverage/**",
    "dist/**",
    "public/**",
  ])
]);

export default eslintConfig;
