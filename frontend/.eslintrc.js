/**
 * 🚀 ALSHAM 360° PRIMA - ESLint Configuration Enterprise 10/10 NASA Standard
 * 
 * Configuração ESLint enterprise-grade com:
 * - Regras rigorosas de qualidade de código
 * - Padrões de segurança e performance
 * - Acessibilidade e boas práticas
 * - Integração com Prettier
 * - Suporte a TypeScript e JSX
 * - Regras customizadas para o projeto
 * 
 * @version 2.0.0
 * @author ALSHAM Team
 * @license MIT
 */

module.exports = {
  // ===== CONFIGURAÇÕES BÁSICAS =====
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
    worker: true,
    serviceworker: true
  },
  
  // ===== PARSER E CONFIGURAÇÕES =====
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      impliedStrict: true
    }
  },

  // ===== EXTENSÕES =====
  extends: [
    'eslint:recommended',
    '@eslint/js/recommended',
    'plugin:import/recommended',
    'plugin:promise/recommended',
    'plugin:security/recommended',
    'plugin:sonarjs/recommended',
    'plugin:unicorn/recommended',
    'plugin:jsdoc/recommended',
    'prettier' // Deve ser o último
  ],

  // ===== PLUGINS =====
  plugins: [
    'import',
    'promise',
    'security',
    'sonarjs',
    'unicorn',
    'jsdoc',
    'no-secrets',
    'optimize-regex',
    'prefer-arrow',
    'unused-imports'
  ],

  // ===== CONFIGURAÇÕES GLOBAIS =====
  globals: {
    // Variáveis globais do projeto
    __APP_VERSION__: 'readonly',
    __BUILD_TIME__: 'readonly',
    __DEV__: 'readonly',
    __PROD__: 'readonly',
    
    // APIs do navegador
    gtag: 'readonly',
    dataLayer: 'readonly',
    
    // Bibliotecas globais
    Supabase: 'readonly',
    Chart: 'readonly'
  },

  // ===== CONFIGURAÇÕES DE IMPORTAÇÃO =====
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
      },
      alias: {
        map: [
          ['@', './src'],
          ['@components', './src/components'],
          ['@pages', './src/pages'],
          ['@js', './src/js'],
          ['@lib', './src/lib'],
          ['@styles', './src/styles'],
          ['@assets', './src/assets'],
          ['@public', './public']
        ],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
      }
    }
  },

  // ===== REGRAS PRINCIPAIS =====
  rules: {
    // ===== REGRAS DE QUALIDADE GERAL =====
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-void': 'error',
    'no-with': 'error',
    'strict': ['error', 'never'],

    // ===== VARIÁVEIS =====
    'no-unused-vars': 'off', // Desabilitado em favor do unused-imports
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_'
      }
    ],
    'no-undef': 'error',
    'no-global-assign': 'error',
    'no-implicit-globals': 'error',

    // ===== FUNÇÕES =====
    'prefer-arrow/prefer-arrow-functions': [
      'warn',
      {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: false
      }
    ],
    'func-style': ['error', 'expression'],
    'prefer-arrow-callback': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'arrow-parens': ['error', 'as-needed'],
    'arrow-spacing': 'error',

    // ===== OBJETOS E ARRAYS =====
    'object-shorthand': 'error',
    'prefer-destructuring': [
      'error',
      {
        array: true,
        object: true
      },
      {
        enforceForRenamedProperties: false
      }
    ],
    'prefer-spread': 'error',
    'prefer-rest-params': 'error',

    // ===== STRINGS E TEMPLATES =====
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'no-useless-concat': 'error',
    'quotes': ['error', 'single', { avoidEscape: true }],

    // ===== PROMISES E ASYNC =====
    'promise/always-return': 'error',
    'promise/no-return-wrap': 'error',
    'promise/param-names': 'error',
    'promise/catch-or-return': 'error',
    'promise/no-native': 'off',
    'promise/no-nesting': 'warn',
    'promise/no-promise-in-callback': 'warn',
    'promise/no-callback-in-promise': 'warn',
    'promise/avoid-new': 'off',
    'promise/no-new-statics': 'error',
    'promise/no-return-in-finally': 'warn',
    'promise/valid-params': 'warn',

    // ===== IMPORTAÇÕES =====
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type'
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ],
    'import/no-unresolved': 'error',
    'import/no-duplicates': 'error',
    'import/no-unused-modules': 'warn',
    'import/no-deprecated': 'warn',
    'import/no-extraneous-dependencies': 'error',
    'import/no-mutable-exports': 'error',
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'off',

    // ===== SEGURANÇA =====
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'warn',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-require': 'warn',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-pseudoRandomBytes': 'error',
    'no-secrets/no-secrets': 'error',

    // ===== PERFORMANCE =====
    'sonarjs/cognitive-complexity': ['error', 15],
    'sonarjs/max-switch-cases': ['error', 30],
    'sonarjs/no-duplicate-string': ['error', 3],
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/no-redundant-boolean': 'error',
    'sonarjs/no-unused-collection': 'error',
    'sonarjs/prefer-immediate-return': 'error',
    'sonarjs/prefer-object-literal': 'error',
    'sonarjs/prefer-single-boolean-return': 'error',

    // ===== UNICORN (BOAS PRÁTICAS) =====
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          kebabCase: true,
          camelCase: true
        }
      }
    ],
    'unicorn/no-null': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/prefer-module': 'error',
    'unicorn/prefer-node-protocol': 'error',
    'unicorn/prefer-top-level-await': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/no-array-for-each': 'off',
    'unicorn/consistent-function-scoping': 'error',
    'unicorn/prefer-spread': 'error',
    'unicorn/prefer-string-slice': 'error',
    'unicorn/prefer-array-some': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/prefer-string-starts-ends-with': 'error',

    // ===== REGEX =====
    'optimize-regex/optimize-regex': 'warn',

    // ===== JSDOC =====
    'jsdoc/require-description': 'error',
    'jsdoc/require-description-complete-sentence': 'error',
    'jsdoc/require-example': 'off',
    'jsdoc/require-hyphen-before-param-description': 'error',
    'jsdoc/require-param': 'error',
    'jsdoc/require-param-description': 'error',
    'jsdoc/require-param-type': 'error',
    'jsdoc/require-returns': 'error',
    'jsdoc/require-returns-description': 'error',
    'jsdoc/require-returns-type': 'error',
    'jsdoc/check-alignment': 'error',
    'jsdoc/check-indentation': 'error',
    'jsdoc/check-param-names': 'error',
    'jsdoc/check-syntax': 'error',
    'jsdoc/check-tag-names': 'error',
    'jsdoc/check-types': 'error',
    'jsdoc/newline-after-description': 'error',
    'jsdoc/no-undefined-types': 'error',
    'jsdoc/valid-types': 'error',

    // ===== ESTILO DE CÓDIGO =====
    'camelcase': ['error', { properties: 'never' }],
    'new-cap': 'error',
    'no-array-constructor': 'error',
    'no-new-object': 'error',
    'no-new-wrappers': 'error',
    'no-underscore-dangle': 'off',
    'one-var': ['error', 'never'],
    'prefer-const': 'error',
    'spaced-comment': ['error', 'always'],

    // ===== COMPLEXIDADE =====
    'complexity': ['error', 10],
    'max-depth': ['error', 4],
    'max-lines': ['error', 500],
    'max-lines-per-function': ['error', 50],
    'max-nested-callbacks': ['error', 3],
    'max-params': ['error', 4],
    'max-statements': ['error', 20],

    // ===== REGRAS CUSTOMIZADAS DO PROJETO =====
    'no-magic-numbers': [
      'warn',
      {
        ignore: [-1, 0, 1, 2, 100, 1000],
        ignoreArrayIndexes: true,
        enforceConst: true,
        detectObjects: false
      }
    ]
  },

  // ===== OVERRIDES PARA ARQUIVOS ESPECÍFICOS =====
  overrides: [
    // ===== ARQUIVOS DE CONFIGURAÇÃO =====
    {
      files: [
        '*.config.js',
        '*.config.mjs',
        '.eslintrc.js',
        'vite.config.js',
        'tailwind.config.js',
        'postcss.config.js'
      ],
      env: {
        node: true
      },
      rules: {
        'no-console': 'off',
        'import/no-extraneous-dependencies': 'off',
        'unicorn/prefer-module': 'off'
      }
    },

    // ===== ARQUIVOS DE TESTE =====
    {
      files: ['**/*.test.js', '**/*.spec.js', '**/tests/**/*.js'],
      env: {
        jest: true,
        mocha: true
      },
      rules: {
        'no-console': 'off',
        'max-lines-per-function': 'off',
        'max-statements': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'jsdoc/require-jsdoc': 'off'
      }
    },

    // ===== ARQUIVOS DO SERVIDOR =====
    {
      files: ['server.js', 'server/**/*.js'],
      env: {
        node: true,
        browser: false
      },
      rules: {
        'no-console': 'off',
        'import/no-extraneous-dependencies': 'off'
      }
    },

    // ===== ARQUIVOS DE BUILD =====
    {
      files: ['build/**/*.js', 'scripts/**/*.js'],
      env: {
        node: true
      },
      rules: {
        'no-console': 'off',
        'import/no-extraneous-dependencies': 'off',
        'unicorn/prefer-module': 'off'
      }
    },

    // ===== ARQUIVOS LEGACY =====
    {
      files: ['legacy/**/*.js', 'vendor/**/*.js'],
      rules: {
        'unicorn/prefer-module': 'off',
        'prefer-arrow/prefer-arrow-functions': 'off',
        'func-style': 'off',
        'jsdoc/require-jsdoc': 'off'
      }
    },

    // ===== WORKERS =====
    {
      files: ['**/*.worker.js', '**/sw.js', '**/service-worker.js'],
      env: {
        worker: true,
        serviceworker: true
      },
      globals: {
        self: 'readonly',
        importScripts: 'readonly',
        workbox: 'readonly'
      }
    }
  ],

  // ===== IGNORAR PADRÕES =====
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.min.js',
    'vendor/',
    'public/assets/',
    '.cache/',
    'logs/'
  ]
};

