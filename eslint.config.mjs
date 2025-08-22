import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import js from "@eslint/js";
import globals from "globals";
const trimGlobals = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.trim(), v]));

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "tailwind.config.ts",
      "vite.config.ts",
      "drizzle.config.ts",
      "postcss.config.js",
    ],
  },
  {
    files: [
      "**/*.{ts,tsx}",
      "server/**/*.ts",
      "client/**/*.ts",
      "client/**/*.tsx",
      "shared/**/*.ts",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      globals: {
        ...trimGlobals(globals.browser),
        ...trimGlobals(globals.node),
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react/no-unknown-property": "off",
      "no-undef": "off",
      "react-hooks/rules-of-hooks": "warn",
    },
    settings: {
      react: { version: "detect" },
    },
  },
];
