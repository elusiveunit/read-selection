module.exports = {
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2017,
  },
  env: {
    browser: true,
    es6: true,
  },
  rules: {
    'no-console': 'off',
    'no-continue': 'off',
    'no-underscore-dangle': 'off',
  },
};
