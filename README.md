# Directory based webpack alias

Use this plugin to specify aliases for single or multiple files in your `webpack.config.js` and optionally define alias extractors for specific files (e.g. `paths` in `tsconfig.json`, or `moduleAliases` in `package.json`)

## Why?

Webpack doesn't allow you to create aliases for specific file.

For example, imagine you have 2 entry points, _A_ and _B_ in your webpack config which are basically separate projects. They do not import anything from each other, but they share some files in `common` folder (standard real-life monorepo structure).

If you use aliases you might find it natural to use `@` symbol to reference the root of your project. But you can't specify `@` to mean project _A_ root and project _B_ root at the same time depending on where it referenced from in a single config file.

This plugin solves this issue by introducing file-relative aliases.

## How to use

Example creating aliases for specific glob pattern:

```js
const glob = require('glob')

const plugin = new DirectoryBasedPlugin(
  {},
  {},
  new Map([
    ...glob
      .sync(`${project1Config.projectPath}/**/`, { ignore: '**/node_modules/**' })
      .map((it) => [it, {@: project1Config.projectPath}]),
    ...glob
      .sync(`${project2Config.projectPath}/**/`, { ignore: '**/node_modules/**' })
      .map((it) => [it, {@: project2Config.projectPath}]),
  ])
)

module.exports = {
  resolve: {
    plugins: [
      plugin,
    ],
  },
}
```

You can also specify names of special files that define your **project root** and extract your aliases from them.

```js
const plugin = new DirectoryBasedPlugin({}, { aliasRoots: ['package.json'] })

plugin.extractors['package.json'] = (packageJsonPath) => {
  const packageConfig = require(packageJsonPath)
  // return value format should be the same as webpack resolve.alias
  return packageConfig._moduleAliases
}
```

This code will resolve aliases for all files under the directory where `package.json` was found according to `_moduleAlias` field in `package.json`.

## Options

### DirectoryBasedPlugin(defaultAlias, options, pathToAliasMap?)

#### defaultAlias

Type: `object`

Default aliases that are used to resolve every compiled file. Uses the same format as webpack `resolve.alias`. Can be overridden by aliases found in `options.aliasRoots` and `options.pathToAliasMap`.

#### options

##### options.aliasRoots

Type: `Array<string>`

Default: [`tsconfig.json`]

Files that include extractable aliases. The plugin will use `plugin.extractors` to extract aliases from them and use extracted aliases to resolve all files under the directory where `aliasRoot` was found.

##### options.ignore

Type: `Array<string>`

Default: [`node_modules`]

Array of substrings that, if found in compiled file path, are excluded from this plugin aliasing.

#### pathToAliasMap

Type: `Map<string, string>`

Default: `new Map()`

Defines alias for specific file. Overrides all other options.
