const resolve = require('path').resolve
const FileAliasPlugin = require('../../').FileAliasPlugin

const baseDir = resolve(__dirname)

const aliasPlugin = new FileAliasPlugin()

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node',
  mode: 'development',
  entry: resolve(baseDir, './index.ts'),
  devtool: false,
  output: {
    clean: true,
    library: {
      type: 'commonjs2',
    },
    path: resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
  resolve: {
    plugins: [aliasPlugin],
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
