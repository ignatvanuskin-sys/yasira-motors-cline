/**
 * ESLint flat-конфиг.
 *
 * Начиная с eslint-config-next 16 пакет отдаёт нативный flat-конфиг, поэтому
 * FlatCompat и @eslint/eslintrc больше не нужны: их использование ломало
 * конфиг на «Converting circular structure to JSON».
 */
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'qa/screens/**',
      'next-env.d.ts',
      '*.log',
      'test-results/**',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Служебные скрипты — это CLI: там console и CommonJS законны.
    files: ['**/*.{js,mjs,cjs}'],
    ignores: ['**/node_modules/**'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'import/no-anonymous-default-export': 'off',
    },
  },
];

export default config;
