const path = require('path')
const plugin = require('../../build/dist/main').FileAlias

const baseDir = path.resolve(__dirname)

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node',
  entry: path.resolve(baseDir, './index.ts'),
  output: {
    clean: true,
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
  },
  resolve: {
    plugins: [],
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
