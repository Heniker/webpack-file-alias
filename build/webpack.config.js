const resolve = require('path').resolve

const baseDir = resolve(__dirname, '../src')

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node',
  mode: 'production',
  entry: resolve(baseDir, './main.ts'),
  devtool: 'source-map',
  output: {
    clean: true,
    library: {
      type: 'commonjs2',
    },
    path: resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
}

module.exports = config
