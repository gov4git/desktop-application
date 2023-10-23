module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'simple-import-sort',
    'react-hooks',
    'react-refresh',
    '@d-dev',
    'jsx-a11y',
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    'import/extensions': 'off',
    'sort-imports': 'off',
    'simple-import-sort/imports': 'error',
    'no-void': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/space-before-function-paren': 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': [
      'error',
      { 'ts-expect-error': 'allow-with-description' },
    ],
    'react-refresh/only-export-components': 'off',
    '@d-dev/extensions': [
      'error',
      [
        {
          expectedExtensions: ['.js', '.json', '.css'],
        },
      ],
    ],
  },
}
