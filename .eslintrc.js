module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  plugins: ['@typescript-eslint', 'prettier'],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    "ecmaVersion": 2022,
    sourceType: 'module'
  },
  "ignorePatterns": [
    "node_modules/",
    "dist/"
  ],
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    'max-len': [
      'error',
      {
        code: 150,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true,
      }
    ],
    'linebreak-style': 0,
    'arrow-parens': [2, 'as-needed'],
    // 'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-console': 'off',
    'import/extensions': 'off',
    'no-use-before-define': [
      'error',
      {
        functions: false
      }
    ],
    'no-promise-executor-return': 'off',
    'no-param-reassign': 'off',
    'no-continue': 'off',
    'no-restricted-syntax': 'off',
    'no-unused-vars': 1
  }
};
