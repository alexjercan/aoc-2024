import html from "@html-eslint/eslint-plugin";
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.{js,mjs,cjs,ts}"],
        languageOptions: { globals: globals.browser },
        rules: {
            "semi": ["error", "always"],
            "quotes": ["error", "double"],
            "no-console": "warn",
            "no-unused-vars": "warn",
            "no-undef": "error",
            "indent": ["error", 4],
        }
    },
    {
        ...html.configs["flat/recommended"],
        files: ["**/*.html"],
    },
    {ignores: ["dist/*", "node_modules/*"],},
];
