module.exports = {
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  extends: ['airbnb-base', 'prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['prettier'],
  rules: {
    'import/prefer-default-export': 'off',
    'prettier/prettier': 'error',
    'class-methods-use-this': 'off',
    camelcase: 'off',
    'no-underscore-dangle': 'off',
  },
};
