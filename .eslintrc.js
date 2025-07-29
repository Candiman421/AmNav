module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 3,  // Match ExtendScript
    sourceType: 'module',
    project: './tsconfig.json'
  },
  rules: {
    // ExtendScript compatibility rules
    'no-var': 'off',  // ExtendScript needs var
    'prefer-const': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',  // ActionManager uses any
    '@typescript-eslint/explicit-function-return-type': 'warn'
  },
  ignorePatterns: ['dist/', 'coverage/', 'node_modules/']
};