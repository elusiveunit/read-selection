module.exports = {
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  plugins: ['react'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2017,
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    es6: true,
  },
  settings: {
    react: {
      pragma: 'el',
    },
  },
  rules: {
    'react/button-has-type': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-uses-vars': 'error',
    'react/jsx-uses-react': 'error',
    'react/react-in-jsx-scope': 'error',

    'no-console': 'off',
    'no-continue': 'off',
    'no-underscore-dangle': 'off',
  },
};
