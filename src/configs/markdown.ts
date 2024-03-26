/* eslint-disable ts/no-unsafe-member-access */
/* eslint-disable ts/no-unsafe-argument */
import { mergeProcessors, processorPassThrough } from 'eslint-merge-processors';
import {
  GLOB_MARKDOWN,
  GLOB_MARKDOWN_CODE,
  GLOB_MARKDOWN_IN_MARKDOWN,
} from '../globs';
import { interopDefault, parserPlain } from '../utils';
import type {
  FlatConfigItem,
  OptionsComponentExts,
  OptionsFiles,
  OptionsOverrides,
} from '../types';

export const markdown = async (
  options: OptionsFiles & OptionsComponentExts & OptionsOverrides = {},
): Promise<FlatConfigItem[]> => {
  const {
    componentExts = [],
    files = [GLOB_MARKDOWN],
    overrides = {},
  } = options;

  const markdownPlugin = await interopDefault(import('eslint-plugin-markdown'));

  return [
    {
      name: 'nivalis:markdown:setup',
      plugins: {
        markdown: markdownPlugin,
      },
    },
    {
      files,
      ignores: [GLOB_MARKDOWN_IN_MARKDOWN],
      name: 'nivalis:markdown:processor',
      /* `eslint-plugin-markdown` only creates virtual files for code blocks,
         but not the markdown file itself. We use `eslint-merge-processors` to
         add a pass-through processor for the markdown file itself. */
      processor: mergeProcessors([
        markdownPlugin.processors.markdown,
        processorPassThrough,
      ]),
    },
    {
      files,
      languageOptions: {
        parser: parserPlain,
      },
      name: 'nivalis:markdown:parser',
    },
    {
      files: [
        GLOB_MARKDOWN_CODE,
        ...componentExts.map(ext => `${GLOB_MARKDOWN}/**/*.${ext}`),
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            impliedStrict: true,
          },
        },
      },
      name: 'nivalis:markdown:disables',
      rules: {
        'import/newline-after-import': 'off',

        'no-alert': 'off',
        'no-console': 'off',
        'no-labels': 'off',
        'no-lone-blocks': 'off',
        'no-restricted-syntax': 'off',
        'no-undef': 'off',
        'no-unused-expressions': 'off',
        'no-unused-labels': 'off',
        'no-unused-vars': 'off',

        'node/prefer-global/process': 'off',
        'style/comma-dangle': 'off',

        'style/eol-last': 'off',
        'ts/await-thenable': 'off',
        'ts/consistent-type-imports': 'off',
        'ts/dot-notation': 'off',
        'ts/no-floating-promises': 'off',
        'ts/no-for-in-array': 'off',
        'ts/no-implied-eval': 'off',
        'ts/no-misused-promises': 'off',

        'ts/no-namespace': 'off',
        'ts/no-redeclare': 'off',
        'ts/no-require-imports': 'off',

        // Type aware rules

        'ts/no-throw-literal': 'off',
        'ts/no-unnecessary-type-assertion': 'off',
        'ts/no-unsafe-argument': 'off',
        'ts/no-unsafe-assignment': 'off',
        'ts/no-unsafe-call': 'off',
        'ts/no-unsafe-member-access': 'off',
        'ts/no-unsafe-return': 'off',
        'ts/no-unused-vars': 'off',
        'ts/no-use-before-define': 'off',
        'ts/no-var-requires': 'off',
        'ts/restrict-plus-operands': 'off',
        'ts/restrict-template-expressions': 'off',
        'ts/unbound-method': 'off',
        'unicode-bom': 'off',
        'unused-imports/no-unused-imports': 'off',
        'unused-imports/no-unused-vars': 'off',

        ...overrides,
      },
    },
  ];
};
