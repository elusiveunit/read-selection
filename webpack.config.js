const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const { NODE_ENV } = process.env;

const isProd = NODE_ENV === 'production';

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
  module: {
    rules: [
      {
        test: /\.scss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                outputStyle: isProd ? 'compressed' : 'expanded',
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '*',
          context: 'src',
          globOptions: {
            ignore: ['**/*.{js,scss}'],
          },
        },
      ],
    }),
  ],
};
