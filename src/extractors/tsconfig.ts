import path from 'path'
import assert from 'assert'
import fs from 'fs'
import chalk from 'chalk'
import { PLUGIN_NAME } from '../env'

const extractorName = 'tsconfig.json'

const handler = (filePath: string) => {
  // console.log('filePath')
  // console.log(filePath)

  assert(
    fs.existsSync(filePath),
    `${chalk.blue(PLUGIN_NAME)}: ${chalk.green(extractorName)} extractor: path ${chalk.inverse(
      filePath
    )} does not exist`
  )

  const { paths, baseUrl } = (() => {
    try {
      return (
        (JSON.parse(fs.readFileSync(filePath).toString())
          .compilerOptions as import('typescript').CompilerOptions) || {}
      )
    } catch (err) {
      throw new Error(
        `${chalk.blue(PLUGIN_NAME)}: ${chalk.green(
          extractorName
        )} extractor: unable to parse ${chalk.inverse(filePath)}`
      )
    }
  })()

  // console.log(JSON.parse(fs.readFileSync(filePath).toString()))

  // console.log('paths:')
  // console.log(paths)
  // console.log(baseUrl)

  if (!baseUrl || !paths) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(paths)
      .filter(([pathKey, pathValues]) => {
        if (pathValues.length !== 1) {
          console.warn(
            `${chalk.blue(PLUGIN_NAME)}: ${chalk.green(
              extractorName
            )} extractor: Multiple paths are not supported. \
            Ignoring key - ${chalk.red(pathKey)} in ${chalk.inverse(filePath)} file`
          )

          return false
        }

        return true
      })
      .map(([pathKey, pathValues]) => {
        const pathVal = pathValues[0]

        assert(
          pathKey && pathVal && typeof pathKey === 'string' && typeof pathVal === 'string',
          `${chalk.blue(PLUGIN_NAME)}: ${chalk.green(extractorName)} extractor: Invalid paths in \
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
