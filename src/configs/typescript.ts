/* eslint-disable max-lines-per-function */
import { GLOB_SRC, GLOB_TS, GLOB_TSX } from '../globs';
import { pluginAntfu } from '../plugins';
import { interopDefault, renameRules, toArray } from '../utils';
import type {
  OptionsComponentExts,
  OptionsFiles,
  OptionsIsQuiet,
  OptionsOverrides,
  OptionsTypeScriptParserOptions,
  OptionsTypeScriptWithTypes,
  TypedFlatConfigItem,
} from '../types';
import type { ESLint } from 'eslint';

export const typescript = async (
  options: OptionsIsQuiet &
    OptionsFiles &
    OptionsComponentExts &
    OptionsOverrides &
    OptionsTypeScriptWithTypes &
    OptionsTypeScriptParserOptions = {},
): Promise<TypedFlatConfigItem[]> => {
  const {
    componentExts = [],
    isInQuietMode = false,
    overrides = {},
    parserOptions = {},
    typeaware = true,
  } = options;

  const files = options.files ?? [
    GLOB_SRC,
    ...componentExts.map(ext => `**/*.${ext}`),
  ];

  const filesTypeAware = options.filesTypeAware ?? [GLOB_TS, GLOB_TSX];
  const tsconfigPath = options?.tsconfigPath
    ? toArray(options.tsconfigPath)
    : './tsconfig.json';

  const isTypeAware = typeaware && !!tsconfigPath;

  const typeAwareRules: TypedFlatConfigItem['rules'] = {
    'dot-notation': 'off',
    'no-implied-eval': 'off',
    'no-throw-literal': 'off',
    'prefer-promise-reject-errors': 'off',
    'require-await': 'off',
    'ts/await-thenable': 'error',
    'ts/consistent-type-exports': [
      'error',
      { fixMixedExportsWithInlineTypeSpecifier: true },
    ],
    'ts/dot-notation': ['error', { allowKeywords: true }],
    'ts/naming-convention': [
      isInQuietMode ? 'off' : 'warn',
      { format: ['PascalCase', 'camelCase'], selector: 'function' },
    ],
    'ts/no-array-delete': 'error',
    'ts/no-base-to-string': 'error',
    'ts/no-confusing-void-expression': 'error',
    'ts/no-duplicate-type-constituents': 'error',
    'ts/no-explicit-any': isInQuietMode ? 'off' : 'warn',
    'ts/no-floating-promises': [
      'error',
      { ignoreIIFE: true, ignoreVoid: true },
    ],
    'ts/no-for-in-array': 'error',
    'ts/no-implied-eval': 'error',
    'ts/no-meaningless-void-operator': 'error',
    'ts/no-misused-promises': [
      'error',
      {
        checksVoidReturn: {
          arguments: false,
          attributes: false,
        },
      },
    ],
    'ts/no-mixed-enums': 'error',
    'ts/no-non-null-assertion': 'error',
    'ts/no-redundant-type-constituents': ['error'],
    'ts/no-throw-literal': 'error',
    'ts/no-unnecessary-boolean-literal-compare': 'error',
    'ts/no-unnecessary-type-arguments': 'error',
    'ts/no-unnecessary-type-assertion': ['error'],
    'ts/no-unsafe-argument': ['error'],
    'ts/no-unsafe-assignment': [isInQuietMode ? 'off' : 'warn'],
    'ts/no-unsafe-call': [isInQuietMode ? 'off' : 'warn'],
    'ts/no-unsafe-enum-comparison': 'error',
    'ts/no-unsafe-member-access': [isInQuietMode ? 'off' : 'warn'],
    'ts/no-unsafe-return': [isInQuietMode ? 'off' : 'warn'],
    'ts/no-useless-template-literals': 'error',
    'ts/non-nullable-type-assertion-style': 'error',
    'ts/prefer-includes': 'error',
    'ts/prefer-nullish-coalescing': [
      'error',
      {
        ignoreConditionalTests: true,
        ignoreMixedLogicalExpressions: true,
        ignorePrimitives: { number: true, string: true },
      },
    ],
    'ts/prefer-optional-chain': ['error'],
    'ts/prefer-promise-reject-errors': 'error',
    'ts/prefer-reduce-type-parameter': 'error',
    'ts/prefer-return-this-type': 'error',
    'ts/prefer-string-starts-ends-with': 'error',
    'ts/promise-function-async': 'error',
    'ts/require-await': ['error'],
    'ts/restrict-plus-operands': 'error',
    'ts/restrict-template-expressions': [
      isInQuietMode ? 'off' : 'warn',
      { allowNumber: true },
    ],
    'ts/switch-exhaustiveness-check': 'error',
    'ts/unbound-method': 'error',
  };

  const [pluginTs, parserTs] = await Promise.all([
    interopDefault(import('@typescript-eslint/eslint-plugin')),
    interopDefault(import('@typescript-eslint/parser')),
  ] as const);

  const makeParser = (
    typeAware: boolean,
    // eslint-disable-next-line ts/no-shadow
    files: string[],
    ignores?: string[],
  ): TypedFlatConfigItem => {
    return {
      files,
      ...(ignores ? { ignores } : {}),
      languageOptions: {
        parser: parserTs,

        parserOptions: {
          extraFileExtensions: componentExts.map(ext => `.${ext}`),
          sourceType: 'module',
          ...(typeAware
            ? {
                project: tsconfigPath,
                tsconfigRootDir: process.cwd(),
              }
            : {}),

          ...(parserOptions as any),
        },
      },
      name: `nivalis/typescript/${typeAware ? 'type-aware-parser' : 'parser'}`,
    };
  };

  return [
    {
      // Install the plugins without globs, so they can be configured separately.
      name: 'nivalis/typescript/setup',
      plugins: {
        antfu: pluginAntfu,
        ts: pluginTs as unknown as ESLint.Plugin,
      },
    },
    // assign type-aware parser for type-aware files and type-unaware parser for the rest
    ...(isTypeAware
      ? [
          makeParser(true, filesTypeAware),
          makeParser(false, files, filesTypeAware),
        ]
      : [makeParser(false, files)]),
    {
      files,
      name: 'nivalis/typescript/rules',
      rules: {
        ...renameRules(
          // eslint-disable-next-line ts/no-non-null-assertion, ts/no-non-null-asserted-optional-chain
          pluginTs.configs['eslint-recommended'].overrides?.[0].rules!,
          { '@typescript-eslint': 'ts' },
        ),
        ...renameRules(
          // eslint-disable-next-line ts/no-non-null-assertion
          pluginTs.configs.strict.rules!,
          { '@typescript-eslint': 'ts' },
        ),

        'default-param-last': 'off',
        'no-array-constructor': 'off',
        'no-dupe-class-members': 'off',
        'no-empty-function': 'off',
        'no-invalid-this': 'off',
        'no-loop-func': 'off',
        'no-loss-of-precision': 'off',
        'no-magic-numbers': 'off',
        'no-redeclare': 'off',
        'no-restricted-imports': 'off',
        'no-shadow': 'off',
        'no-undef': 'off',
        'no-unused-expressions': 'off',
        'no-unused-vars': 'off',
        'no-use-before-define': 'off',
        'no-useless-constructor': 'off',

        'ts/adjacent-overload-signatures': ['error'],
        'ts/array-type': ['error', { default: 'array-simple' }],
        'ts/ban-ts-comment': [
          'error',
          {
            minimumDescriptionLength: 4,
            'ts-expect-error': 'allow-with-description',
          },
        ],
        'ts/ban-tslint-comment': ['error'],
        'ts/ban-types': [
          'error',
          {
            extendDefaults: false,
            types: {
              '[[[[[]]]]]': '🦄💥',
              '[[[[]]]]': 'ur drunk 🤡',
              '[[[]]]': "Don't use `[[[]]]`. Use `SomeType[][][]` instead.",
              '[[]]':
                "Don't use `[[]]`. It only allows an array with a single element which is an empty array. Use `SomeType[][]` instead.",
              '[]': "Don't use the empty array type `[]`. It only allows empty arrays. Use `SomeType[]` instead.",
              '{}': {
                fixWith: 'Record<string, unknown>',
                message:
                  'The `{}` type is mostly the same as `unknown`. You probably want `Record<string, unknown>` instead.',
              },
              BigInt: {
                fixWith: 'bigint',
                message: 'Use `bigint` instead.',
              },
              Boolean: {
                fixWith: 'boolean',
                message: 'Use `boolean` instead.',
              },
              Function:
                'Use a specific function type instead, like `() => void`.',
              Number: {
                fixWith: 'number',
                message: 'Use `number` instead.',
              },
              object: {
                fixWith: 'Record<string, unknown>',
                message:
                  'The `object` type is hard to use. Use `Record<string, unknown>` instead. See: https://github.com/typescript-eslint/typescript-eslint/pull/848',
              },
              Object: {
                fixWith: 'Record<string, unknown>',
                message:
                  'The `Object` type is mostly the same as `unknown`. You probably want `Record<string, unknown>` instead. See https://github.com/typescript-eslint/typescript-eslint/pull/848',
              },
              String: {
                fixWith: 'string',
                message: 'Use `string` instead.',
              },
              Symbol: {
                fixWith: 'symbol',
                message: 'Use `symbol` instead.',
              },
            },
          },
        ],
        'ts/class-literal-property-style': ['error', 'getters'],
        'ts/consistent-generic-constructors': ['error', 'constructor'],
        'ts/consistent-indexed-object-style': ['error', 'index-signature'],
        'ts/consistent-type-assertions': [
          'error',
          {
            assertionStyle: 'as',
            objectLiteralTypeAssertions: 'allow-as-parameter',
          },
        ],
        'ts/consistent-type-definitions': ['error', 'type'],
        'ts/consistent-type-imports': [
          'error',
          {
            disallowTypeAnnotations: false,
            fixStyle: 'separate-type-imports',
            prefer: 'type-imports',
          },
        ],
        'ts/default-param-last': ['error'],
        'ts/member-ordering': ['error'],
        'ts/method-signature-style': ['error', 'property'], // https://www.totaltypescript.com/method-shorthand-syntax-considered-harmful
        'ts/no-array-constructor': ['error'],
        'ts/no-confusing-non-null-assertion': 'error',
        'ts/no-dupe-class-members': 'error',
        'ts/no-duplicate-enum-values': ['error'],
        'ts/no-dynamic-delete': 'off',
        'ts/no-empty-function': [
          'error',
          { allow: ['arrowFunctions', 'functions', 'methods'] },
        ],
        'ts/no-empty-interface': ['error', { allowSingleExtends: true }],
        'ts/no-explicit-any': 'off',
        'ts/no-extra-non-null-assertion': ['error'],
        'ts/no-extraneous-class': [
          isInQuietMode ? 'off' : 'warn',
          {
            allowConstructorOnly: false,
            allowEmpty: false,
            allowStaticOnly: false,
            allowWithDecorator: true,
          },
        ],
        'ts/no-import-type-side-effects': 'error',
        'ts/no-inferrable-types': [
          'error',
          { ignoreParameters: true, ignoreProperties: false },
        ],
        'ts/no-invalid-void-type': ['error'],
        'ts/no-loop-func': ['error'],
        'ts/no-loss-of-precision': ['error'],
        'ts/no-magic-numbers': [
          isInQuietMode ? 'off' : 'warn',
          {
            detectObjects: false,
            enforceConst: true,
            ignore: [0, 1, -1],
            ignoreArrayIndexes: true,
          },
        ],
        'ts/no-misused-new': ['error'],
        'ts/no-namespace': [
          'error',
          { allowDeclarations: false, allowDefinitionFiles: false },
        ],
        'ts/no-non-null-asserted-nullish-coalescing': ['error'],
        'ts/no-non-null-asserted-optional-chain': ['error'],
        'ts/no-non-null-assertion': 'off',
        'ts/no-redeclare': 'error',
        'ts/no-require-imports': 'error',
        'ts/no-shadow': [
          isInQuietMode ? 'off' : 'warn',
          {
            allow: ['resolve', 'reject', 'done', 'next', 'err', 'error', 'cb'],
            builtinGlobals: false,
            hoist: 'functions',
            ignoreFunctionTypeParameterNameValueShadow: true,
            ignoreTypeValueShadow: true,
          },
        ],
        'ts/no-this-alias': ['error', { allowDestructuring: true }],
        'ts/no-unnecessary-type-constraint': ['error'],
        'ts/no-unused-expressions': [
          'error',
          {
            allowShortCircuit: false,
            allowTaggedTemplates: false,
            allowTernary: false,
            enforceForJSX: true,
          },
        ],
        'ts/no-unused-vars': [
          'error',
          {
            args: 'after-used',
            argsIgnorePattern: '^_',
            ignoreRestSiblings: true,
            vars: 'all',
            varsIgnorePattern: '^_',
          },
        ],
        'ts/no-use-before-define': [
          'error',
          {
            allowNamedExports: false,
            classes: false,
            functions: false,
            variables: true,
          },
        ],
        'ts/no-useless-constructor': ['error'],
        'ts/no-useless-empty-export': ['error'],
        'ts/no-var-requires': ['error'],
        'ts/parameter-properties': ['error', { prefer: 'parameter-property' }],
        'ts/prefer-as-const': ['error'],
        'ts/prefer-for-of': ['error'],
        'ts/prefer-function-type': ['error'],
        'ts/prefer-literal-enum-member': ['error'],
        'ts/prefer-namespace-keyword': ['error'],
        'ts/prefer-ts-expect-error': ['error'],
        'ts/triple-slash-reference': [
          isInQuietMode ? 'off' : 'warn',
          { lib: 'never', path: 'never', types: 'never' },
        ],
        'ts/unified-signatures': [
          'error',
          { ignoreDifferentlyNamedParameters: true },
        ],
        'unused-imports/no-unused-vars': 'off',
        ...overrides,
      },
    },
    ...(isTypeAware
      ? [
          {
            files: filesTypeAware,
            name: 'nivalis/typescript/rules-type-aware',
            rules: {
              ...(tsconfigPath ? typeAwareRules : {}),
              ...overrides,
            },
          },
        ]
      : []),
    {
      files: ['**/*.d.ts'],
      name: 'nivalis/typescript/disables/dts',
      rules: {
        'eslint-comments/no-unlimited-disable': 'off',
        'import/no-duplicates': 'off',
        'no-restricted-syntax': 'off',
        'unused-imports/no-unused-vars': 'off',
      },
    },
    {
      files: ['**/*.{test,spec}.ts?(x)'],
      name: 'nivalis/typescript/disables/test',
      rules: {
        'no-unused-expressions': 'off',
      },
    },
    {
      files: ['**/*.js', '**/*.cjs'],
      name: 'nivalis/typescript/disables/cjss',
      rules: {
        'ts/no-require-imports': 'off',
        'ts/no-var-requires': 'off',
      },
    },
  ];
};
