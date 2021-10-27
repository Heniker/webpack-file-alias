import path from 'path'
import assert from 'assert'
import fs from 'fs'
import chalk from 'chalk'
import { PLUGIN_NAME } from '../env'

const extractorName = 'tsconfig.json'

const handler = (filePath: string) => {
  assert(
    fs.existsSync(filePath),
    `${PLUGIN_NAME}: ${extractorName} extractor: path ${chalk.inverse(filePath)} does not exists`
  )
  const { paths, baseUrl } =
    (require(filePath).compilerOptions as import('typescript').CompilerOptions) || {}

  if (!baseUrl || !paths) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(paths)
      .filter(([pathKey, pathValues]) => {
        if (pathValues.length !== 1) {
          console.warn(
            `${PLUGIN_NAME}: ${extractorName} extractor: Multiple paths are not supported. \
            Ignoring key - ${chalk.red(pathKey)} in ${chalk.inverse(filePath)} file`
          )

          return false
        }

        return true
      })
      .map(([pathKey, pathValues]) => {
        const pathVal = pathValues[0]

        assert(
          pathKey && pathVal,
          `${PLUGIN_NAME}: ${extractorName} extractor: Invalid paths in \
          "${chalk.inverse(filePath)}" file`
        )

        const key = pathKey.replace('/*', '')
        const value = path.resolve(path.dirname(filePath), baseUrl, pathVal.replace('/*', ''))
        return [key, value]
      })
  )
}

const extractor = { name: extractorName, handler }

export { extractor }
