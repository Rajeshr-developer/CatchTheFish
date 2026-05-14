const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const rootDir = path.resolve(__dirname);
const webShimsDir = path.join(rootDir, 'src', 'web-shims');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProd ? 'production' : 'development',
  entry: './index.web.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProd ? 'bundle.[contenthash].js' : 'bundle.js',
    // './' makes asset paths relative — required for GitHub Pages subdirectory hosting
    publicPath: './',
    assetModuleFilename: 'assets/[name][ext]',
    clean: true,
  },
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
    alias: {
      'react-native': 'react-native-web',
      'rn-sprite-sheet': path.join(webShimsDir, 'SpriteSheet.js'),
      'react-native-sprite-sheet': path.join(webShimsDir, 'SpriteImageShim.js'),
      'react-native-animated-sprite': path.join(webShimsDir, 'SpriteImageShim.js'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules\/(?!(react-native-web)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: false,
            presets: [
              ['@babel/preset-env', { targets: { browsers: ['last 2 versions'] } }],
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    port: 8080,
    open: true,
    hot: true,
    historyApiFallback: true,
  },
};
