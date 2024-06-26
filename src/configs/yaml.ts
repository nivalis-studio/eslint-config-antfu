import { GLOB_YAML } from '../globs';
import { interopDefault } from '../utils';
import { DEFAULT_INDENT } from '../constants';
import type {
  OptionsFiles,
  OptionsOverrides,
  OptionsStylistic,
  TypedFlatConfigItem,
} from '../types';
import type { ESLint } from 'eslint';

export const yaml = async (
  options: OptionsOverrides & OptionsStylistic & OptionsFiles = {},
): Promise<TypedFlatConfigItem[]> => {
  const { files = [GLOB_YAML], overrides = {}, stylistic = true } = options;

  const [pluginYaml, parserYaml] = await Promise.all([
    interopDefault(import('eslint-plugin-yml')),
    interopDefault(import('yaml-eslint-parser')),
  ] as const);

  return [
    {
      name: 'nivalis/yaml/setup',
      plugins: {
        yaml: pluginYaml as unknown as ESLint.Plugin,
      },
    },
    {
      files,
      languageOptions: {
        parser: parserYaml,
      },
      name: 'nivalis/yaml/rules',
      rules: {
        'style/spaced-comment': 'off',

        'yaml/block-mapping': 'error',
        'yaml/block-sequence': 'error',
        'yaml/no-empty-document': 'error',
        'yaml/no-empty-key': 'error',
        'yaml/no-empty-mapping-value': 'off',
        'yaml/no-empty-sequence-entry': 'error',
        'yaml/no-irregular-whitespace': 'error',
        'yaml/plain-scalar': 'error',

        'yaml/vue-custom-block/no-parsing-error': 'error',

        ...(stylistic
          ? {
              'yaml/block-mapping-question-indicator-newline': 'error',
              'yaml/block-sequence-hyphen-indicator-newline': 'error',
              'yaml/flow-mapping-curly-newline': 'error',
              'yaml/flow-mapping-curly-spacing': 'error',
              'yaml/flow-sequence-bracket-newline': 'error',
              'yaml/flow-sequence-bracket-spacing': 'error',
              'yaml/indent': ['error', DEFAULT_INDENT],
              'yaml/key-spacing': 'error',
              'yaml/no-tab-indent': 'error',
              'yaml/quotes': [
                'error',
                { avoidEscape: false, prefer: 'double' },
              ],
              'yaml/spaced-comment': 'error',
            }
          : {}),

        ...overrides,
      },
    },
  ];
};
