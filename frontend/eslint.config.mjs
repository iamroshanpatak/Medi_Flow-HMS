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
  ]),
]);

export default eslintConfig;
