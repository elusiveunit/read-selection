const path = require('path');

const { NODE_ENV } = process.env;

module.exports = {
  mode: NODE_ENV || 'development',
  devtool: 'inline-cheap-source-map',
  entry: {
    'background': './src/background.js',
    'options-page': './src/options-page.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};
