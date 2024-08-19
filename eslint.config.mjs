import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
    plugins: {
      js: pluginJs,
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
];
