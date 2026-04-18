// ESLint 9 flat config — TypeScript + React 19 + Vite.
// Replaces the legacy .eslintrc.js.
//
// Security rules map to OWASP WSTG vulnerability classes (see docs/PRD-security.md):
//  - react/no-danger, no-unsanitized/* → INPV-01/02 (XSS)
//  - react/jsx-no-script-url           → CLNT-04 (redirect / javascript: URL)
//  - react/jsx-no-target-blank         → CLNT-05 (tabnabbing)
//  - no-eval + security/detect-eval-*  → INPV-11 (code injection)
//  - security/detect-unsafe-regex      → INPV-07 (ReDoS)
//  - security/detect-pseudo-random-*   → CRYP (weak crypto)
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import security from 'eslint-plugin-security';
import noUnsanitized from 'eslint-plugin-no-unsanitized';
import pluginQuery from '@tanstack/eslint-plugin-query';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'out/**',
      'generated/**',
      'src/assets/**',
      'scripts/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
      security,
      'no-unsanitized': noUnsanitized,
      '@tanstack/query': pluginQuery,
      import: importPlugin,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      // React core
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      // a11y rules — legacy debt, warn-only until dedicated accessibility pass (follow-up PR)
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-redundant-roles': 'warn',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // ── ERRORS: doctrine + safety (must stay clean in CI) ─────────────
      // Keys must be primary keys from the data layer. docs/PRD-react-keys-cleanup.md
      'react/no-array-index-key': 'error',
      // Type safety — orval is the source of truth; no escape hatches.
      '@typescript-eslint/no-explicit-any': 'error',

      // XSS sinks (WSTG-INPV-01/02, CLNT-04/05)
      'react/no-danger': 'error',
      'react/jsx-no-script-url': 'error',
      'react/jsx-no-target-blank': ['error', { allowReferrer: false }],
      'no-unsanitized/method': 'error',
      'no-unsanitized/property': 'error',

      // Code injection (WSTG-INPV-11)
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'security/detect-eval-with-expression': 'error',

      // Misc security
      'security/detect-unsafe-regex': 'error',
      'security/detect-pseudoRandomBytes': 'error',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-object-injection': 'off', // very noisy; enable per-file if needed

      // TanStack Query correctness
      '@tanstack/query/exhaustive-deps': 'error',
      '@tanstack/query/stable-query-client': 'error',
      '@tanstack/query/no-rest-destructuring': 'warn',
      '@tanstack/query/no-unstable-deps': 'error',
      '@tanstack/query/infinite-query-property-order': 'error',

      // Architecture — enforce dependency direction: app → pages → features
      'import/no-restricted-paths': ['error', {
        zones: [
          { target: './src/features', from: './src/pages', message: 'features/ cannot import from pages/' },
          { target: './src/features', from: './src/app', message: 'features/ cannot import from app/' },
          { target: './src/pages', from: './src/app', message: 'pages/ cannot import from app/' },
        ],
      }],

      // ── WARNINGS: historical debt, clean up opportunistically ─────────
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-object-type': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'no-empty': 'warn',
      'no-useless-escape': 'warn',
    },
  },

  // Test files — relax a few rules that are noisy in test context
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'security/detect-non-literal-regexp': 'off',
    },
  },

  // Prettier — disable style rules that conflict. Must come last.
  prettier,
);
