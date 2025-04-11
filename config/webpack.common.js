const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    main: path.join(__dirname, '../src/main.js'),
    category: path.join(__dirname, '../src/frontend/views/category.js'),
    detail: path.join(__dirname, '../src/frontend/views/detail.js'),
    search: path.join(__dirname, '../src/frontend/views/search.js'),
    profile: path.join(__dirname, '../src/frontend/views/profile.js'),
    login: path.join(__dirname, '../src/frontend/js/login.js'),
    register: path.join(__dirname, '../src/frontend/js/register.js'),
    reset: path.join(__dirname, '../src/frontend/views/reset.js')
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/index.html'),
      filename: 'index.html',
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/category.html'),
      filename: 'category.html',
      chunks: ['category']
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/detail.html'),
      filename: 'detail.html',
      chunks: ['detail']
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/search.html'),
      filename: 'search.html',
      chunks: ['search']
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/profile.html'),
      filename: 'profile.html',
      chunks: ['profile']
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/login.html'),
      filename: 'login.html',
      chunks: ['login']
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/register.html'),
      filename: 'register.html',
      chunks: ['register']
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/reset.html'),
      filename: 'reset.html',
      chunks: ['reset']
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, '../src/frontend/image'),
          to: path.join(__dirname, 'dist/frontend/image'), // Arahkan ke direktori yang tepat
        },
      ],
    }),
  ],
};