const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const publicPath = process.env.PUBLIC_URL || '/';

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.[contenthash].js',
    clean: true,
    publicPath: publicPath,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              jsx: 'react-jsx'
            }
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          'postcss-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@utils': path.resolve(__dirname, 'src/shared/utils'),
      '@types': path.resolve(__dirname, 'src/shared/types'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      publicPath: publicPath,
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.[contenthash].css',
    }),
    new ForkTsCheckerWebpackPlugin(),
  ],
  devServer: {
    historyApiFallback: true,
    hot: true,
    port: 3000,
    host: 'localhost',
    open: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    static: {
      directory: path.join(__dirname, 'public'),
    },
  },
  devtool: 'source-map',
}; 