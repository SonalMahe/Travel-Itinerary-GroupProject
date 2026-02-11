import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  {
    rules: {
    // 1. No Implicit Any-
    '@typescript-eslint/no-explicit-any': 'error',

    // 2. Consistent Arrow Functions-
    '@typescript-eslint/prefer-arrow-callback': 'error',

    // 3. No Unused Variables-
    '@typescript-eslint/no-unused-vars': ['error'],

    // 4. Strict Equality-
    'eqeqeq': ['error', 'always'],

    // 5. Async/Await Consistency-
    '@typescript-eslint/no-floating-promises': 'error',

    // 6. Naming Conventions-
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variableLike',
        format: ['camelCase'],
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
    ],
  },
  },
]);

