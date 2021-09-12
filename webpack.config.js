const path = require('path'),
  TerserPlugin = require('terser-webpack-plugin'),
  VueLoaderPlugin = require('vue-loader/lib/plugin');

const isDev = process.env.NODE_ENV === "development";

const webpack = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ]
      },
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist')
  }
};

if (!isDev) {
  webpack.optimization = {
    minimize: true,
    minimizer: [new TerserPlugin()],
  };
}

module.exports = webpack;
