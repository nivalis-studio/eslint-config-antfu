/* eslint-disable ts/no-unsafe-assignment */
// @ts-expect-error missing types
import styleMigrate from '@stylistic/eslint-plugin-migrate';
import { nivalis } from './src';

export default nivalis(
  {
    formatters: true,
  },
  {
    files: ['src/**/*.ts'],
    rules: {
      'perfectionist/sort-objects': 'error',
      'ts/no-unsafe-assignment': 'off',
      'ts/no-explicit-any': 'off',
    },
  },
  {
    files: ['src/configs/*.ts'],
    plugins: {
      'style-migrate': styleMigrate,
    },
    rules: {
      'style-migrate/migrate': ['error', { namespaceTo: 'style' }],
    },
  },
  {
    ignores: ['fixtures/**/*'],
  },
);
