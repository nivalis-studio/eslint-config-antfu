import { DEFAULT_INDENT } from '../constants';
import { ensurePackages, interopDefault } from '../utils';
import { GLOB_SVELTE } from '../globs';
import type {
  FlatConfigItem,
  OptionsFiles,
  OptionsHasTypeScript,
  OptionsOverrides,
  OptionsStylistic,
} from '../types';
import type { ESLint } from 'eslint';

export const svelte = async (
  options: OptionsHasTypeScript &
    OptionsOverrides &
    OptionsStylistic &
    OptionsFiles = {},
): Promise<FlatConfigItem[]> => {
  const { files = [GLOB_SVELTE], overrides = {}, stylistic = true } = options;

  const { indent = DEFAULT_INDENT, quotes = 'single' } =
    typeof stylistic === 'boolean' ? {} : stylistic;

  ensurePackages(['eslint-plugin-svelte']);

  const [pluginSvelte, parserSvelte] = await Promise.all([
    interopDefault(import('eslint-plugin-svelte')),
    interopDefault(import('svelte-eslint-parser')),
  ] as const);

  return [
    {
      name: 'nivalis:svelte:setup',
      plugins: {
        svelte: pluginSvelte as unknown as ESLint.Plugin,
      },
    },
    {
      files,
      languageOptions: {
        parser: parserSvelte,
        parserOptions: {
          extraFileExtensions: ['.svelte'],
          parser: options.typescript
            ? ((await interopDefault(
                import('@typescript-eslint/parser'),
              )) as unknown)
            : null,
        },
      },
      name: 'nivalis:svelte:rules',
      processor: pluginSvelte.processors['.svelte'],
      rules: {
        'import/no-mutable-exports': 'off',
        'no-undef': 'off', // incompatible with most recent (attribute-form) generic types RFC
        'no-unused-vars': [
          'error',
          {
            args: 'none',
            caughtErrors: 'none',
            ignoreRestSiblings: true,
            vars: 'all',
            varsIgnorePattern: '^\\$\\$Props$',
          },
        ],

        'svelte/comment-directive': 'error',
        'svelte/no-at-debug-tags': 'warn',
        'svelte/no-at-html-tags': 'error',
        'svelte/no-dupe-else-if-blocks': 'error',
        'svelte/no-dupe-style-properties': 'error',
        'svelte/no-dupe-use-directives': 'error',
        'svelte/no-dynamic-slot-name': 'error',
        'svelte/no-export-load-in-svelte-module-in-kit-pages': 'error',
        'svelte/no-inner-declarations': 'error',
        'svelte/no-not-function-handler': 'error',
        'svelte/no-object-in-text-mustaches': 'error',
        'svelte/no-reactive-functions': 'error',
        'svelte/no-reactive-literals': 'error',
        'svelte/no-shorthand-style-property-overrides': 'error',
        'svelte/no-unknown-style-directive-property': 'error',
        'svelte/no-unused-svelte-ignore': 'error',
        'svelte/no-useless-mustaches': 'error',
        'svelte/require-store-callbacks-use-set-param': 'error',
        'svelte/system': 'error',
        'svelte/valid-compile': 'error',
        'svelte/valid-each-key': 'error',

        'unused-imports/no-unused-vars': [
          'error',
          {
            args: 'after-used',
            argsIgnorePattern: '^_',
            vars: 'all',
            varsIgnorePattern: '^(_|\\$\\$Props$)',
          },
        ],

        ...(stylistic
          ? {
              'style/indent': 'off', // superseded by svelte/indent
              'style/no-trailing-spaces': 'off', // superseded by svelte/no-trailing-spaces
              'svelte/derived-has-same-inputs-outputs': 'error',
              'svelte/html-closing-bracket-spacing': 'error',
              'svelte/html-quotes': ['error', { prefer: quotes }],
              'svelte/indent': [
                'error',
                { alignAttributesVertically: true, indent },
              ],
              'svelte/mustache-spacing': 'error',
              'svelte/no-spaces-around-equal-signs-in-attribute': 'error',
              'svelte/no-trailing-spaces': 'error',
              'svelte/spaced-html-comment': 'error',
            }
          : {}),

        ...overrides,
      },
    },
  ];
};
