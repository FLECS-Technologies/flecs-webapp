module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true
  },
  extends: ['plugin:react/recommended', 'standard', 'prettier'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['react'],
  rules: {
    camelcase: 'off',
    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'no-undef': 'off',
    'no-unused-vars': 'off'
  }
}
