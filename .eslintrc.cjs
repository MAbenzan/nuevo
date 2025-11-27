module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { project: null, sourceType: 'module' },
  plugins: ['@typescript-eslint', 'playwright'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:playwright/recommended', 'prettier'],
  ignorePatterns: ['dist/', 'reports/output/', 'reports/.artifacts/', 'reports/**/*.ts'],
  rules: {
    'playwright/no-focused-test': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/ban-ts-comment': 'off'
  }
}