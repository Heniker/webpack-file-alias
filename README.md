# Webpack file alias plugin

Use this plugin to specify aliases for single or multiple files and optionally define alias extractors for specific files (e.g. `paths` in `tsconfig.json`, or `moduleAliases` in `package.json`)

## Why?

Webpack cannot create aliases for specific file.

For example, imagine you have 2 entry points, _A_ and _B_ in your webpack config which are basically separate projects. They do not import anything from each other, but they share some files in `common` folder (standard real-life monorepo structure).

If you use aliases you might find it natural to use `@` symbol to reference the root of your project. But you can't specify `@` to mean project _A_ root and project _B_ root at the same time depending on where it is referenced from in a single config file.

This plugin solves this issue by introducing file-relative aliases.

## How to use

A use-case I had in mind for this plugin is extracting aliases from multiple `tsconfig.json` files.

If that's what you're looking for, you don't need to configure anything in order for it to work:

```js
const FileAliasPlugin = require('file-alias-webpack-plugin')
const plugin = new FileAliasPlugin()

module.exports = {
  resolve: {
    // Place it in resolve.plugins, not in regular plugins
    plugins: [
      plugin,
    ],
  },
}
```
See [example/2](https://github.com/Heniker/webpack-file-alias/tree/master/example/2) for 'real-world' example.

## TypeScript support

You should have typescript typings avaliable once you install this plugin.

## Todo

Right now project uses webpack for compatibility reasons (esm support is weird). The project is small, so that's not a big deal. But there is no reason to use webpack to bundle a library.

For more complex use-cases you might have to set `transpileOnly: true` for `ts-loader`. `ts-loader` uses it's own path-resolver in order to type-check typescript code. This needs to be solved, possibly by using [resolveModuleName](https://github.com/TypeStrong/ts-loader#resolvemodulename-and-resolvetypereferencedirective).
