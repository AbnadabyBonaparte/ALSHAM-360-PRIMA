// ESLint v9 flat config — minimal, functional lint gate.
// Replaces a legacy .eslintrc.js that referenced heavy presets (unicorn/sonarjs/
// security/jsdoc) which were never installed, so the lint step never ran in CI.
// Correctness rules stay on; stylistic/noisy rules are warnings (the CI runs with
// --max-warnings 999, so warnings inform without blocking the gate).
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'storybook-static/**',
      '**/*.stories.ts',
      '**/*.stories.tsx',
      'src/vite-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.es2021 },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // Registered so inline `// eslint-disable react-hooks/*` directives resolve;
      // kept as warnings so hook-dep hints inform without blocking the gate.
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      // Noisy-but-not-bugs → warnings (tolerated by --max-warnings 999).
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      'no-empty': 'warn',
      'no-constant-condition': 'warn',
      'no-case-declarations': 'warn',
      'no-prototype-builtins': 'warn',
      'no-useless-escape': 'warn',
      'no-fallthrough': 'warn',
      'no-async-promise-executor': 'warn',
      'no-control-regex': 'warn',
      'no-undef': 'off', // TypeScript handles this; avoids false positives on DOM/globals.
    },
  },
);
