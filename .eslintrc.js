module.exports = {
  extends: [
    'airbnb',
    'prettier',
    // 'plugin:jest/recommended',
    'plugin:import/typescript',
  ],
  env: {
    browser: true,
    node: true,
    jasmine: true,
    jest: true,
    es6: true,
  },
  settings: {
    react: {
      version: '16.9',
    },
  },
  parser: '@typescript-eslint/parser',
  plugins: ['babel', '@typescript-eslint', 'unicorn'],
  // https://github.com/typescript-eslint/typescript-eslint/issues/46#issuecomment-470486034
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': [2, { args: 'none' }],
        'no-unused-expressions': 'off',
        "react/static-property-placement": 0,
        // '@typescript-eslint/no-unused-expressions': 2,
      },
    },
    {
      files: ['*.md'],
      globals: {
        React: true,
        ReactDOM: true,
        mountNode: true,
      },
      rules: {
        indent: 0,
        'no-console': 0,
        'no-plusplus': 0,
        'eol-last': 0,
        'no-script-url': 0,
        'prefer-rest-params': 0,
        'import/no-extraneous-dependencies': 0,
      },
    },
  ],
  rules: {
    'guard-for-in': 0,
    // soolx
    'array-callback-return': 0,
    'class-methods-use-this': 0,
    'comma-dangle': 0,
    'import/prefer-default-export': 0,
    'no-console': [1, { allow: ["info", "warn", "error"] }],
    'no-loop-func': 0,
    'no-multi-assign': 0,
    'no-nested-ternary': 0,
    'no-restricted-properties': 0,
    'no-restricted-syntax': 0,
    'prefer-destructuring': 0,
    'prefer-rest-params': 0,
    'prefer-spread': 0,
    'valid-typeof': 0,

    'import/extensions': 0,
    'import/no-cycle': 0,
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          'site/**',
          'tests/**',
          'scripts/**',
          '**/*.test.js',
          '**/__tests__/*',
          '*.config.js',
          '**/*.md',
        ],
      },
    ],
    // 'comma-dangle': ['error', 'always-multiline'],
    'consistent-return': 0, // TODO: remove later
    'no-param-reassign': 0, // TODO: remove later
    'no-underscore-dangle': 0,
    // for (let i = 0; i < len; i++)
    'no-plusplus': 0,
    // https://eslint.org/docs/rules/no-continue
    // labeledLoop is conflicted with `eslint . --fix`
    'no-continue': 0,
    // ban this for Number.isNaN needs polyfill
    'no-restricted-globals': 0,
    'max-classes-per-file': 0,

    // 'jest/no-test-callback': 0,
    // 'jest/expect-expect': 0,
    // 'jest/no-done-callback': 0,
    // 'jest/valid-title': 0,
    // 'jest/no-conditional-expect': 0,

    'unicorn/better-regex': 2,
    'unicorn/prefer-trim-start-end': 2,
    'unicorn/expiring-todo-comments': 2,
    'unicorn/no-abusive-eslint-disable': 2,

    // https://github.com/typescript-eslint/typescript-eslint/issues/2540#issuecomment-692866111
    'no-use-before-define': 0,
    '@typescript-eslint/no-use-before-define': 0,
    'no-shadow': 0,
    '@typescript-eslint/no-shadow': [2, { ignoreTypeValueShadow: true }],
    // https://github.com/typescript-eslint/typescript-eslint/issues/2528#issuecomment-689369395
    'no-undef': 0,
    "prefer-template": 0,
  },
  globals: {
    gtag: true,
  },
};