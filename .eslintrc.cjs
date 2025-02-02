module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    "spaced-comment": [
      2,
      "always",
      {markers: ["global", "globals", "eslint", "eslint-disable", "*package", "!", ","]},
    ],
    "@typescript-eslint/no-explicit-any": ["off"],
    "react-hooks/exhaustive-deps": "off",
    "no-case-declarations": "off"
  }
}
