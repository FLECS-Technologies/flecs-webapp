module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['plugin:react/recommended', 'plugin:react/jsx-runtime', 'standard', 'prettier'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    camelcase: 'off',
    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'no-undef': 'off',
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/no-array-index-key': 'error',
    // Enforce dependency direction: app → pages → features → shared
    'import/no-restricted-paths': ['error', {
      zones: [
        // shared/ cannot import from features/, pages/, or app/
        { target: './src/shared', from: './src/features', message: 'shared/ cannot import from features/' },
        { target: './src/shared', from: './src/pages', message: 'shared/ cannot import from pages/' },
        { target: './src/shared', from: './src/app', message: 'shared/ cannot import from app/' },
        // features/ cannot import from pages/ or app/
        { target: './src/features', from: './src/pages', message: 'features/ cannot import from pages/' },
        { target: './src/features', from: './src/app', message: 'features/ cannot import from app/' },
        // pages/ cannot import from app/
        { target: './src/pages', from: './src/app', message: 'pages/ cannot import from app/' },
      ],
    }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
