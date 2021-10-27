import path from 'path'
import memoize from 'lodash.memoize'
import { findUpMultiple } from 'find-up'
import asyncFlatMap from 'async/flatMap'
import { PLUGIN_NAME } from './env'
import { extractor as tsconfigExtractor } from './extractors/tsconfig'
import { ResolvePluginInstance, Resolver, ResolveRequest } from './types/plugin'

type HandlerT = (arg: string) => Record<string, string>

const memoizeFindUp = memoize(findUpMultiple, (...arg: any[]) => arg[0] + arg[1].cwd)

export class FileAliasPlugin implements ResolvePluginInstance {
  extractors: Record<string, HandlerT> = {}
  private defaultAlias: Record<string, string>
  private options: { ignore: string[] }
  private pathToAliasMap: Map<string, Record<string, string>>
  private source: string
  private target: string

  registerExtractor(extractor: { name: string; handler: HandlerT }) {
    this.extractors[extractor.name] = extractor.handler
  }

  apply(resolver: Resolver) {
    const target = resolver.ensureHook(this.target)
    resolver
      .getHook(this.source)
      .tapAsync({ name: PLUGIN_NAME }, async (request, resolveContext, callback) => {
        if (await this.updateRequest(request)) {
          return resolver.doResolve(target, request, null, resolveContext, callback)
        }
        return callback()
      })
  }

  constructor(defaultAlias = {}, pathToAliasMap = new Map(), options = {}) {
    this.defaultAlias = defaultAlias
    this.options = Object.assign({ ignore: ['node_modules'] }, options)
    this.pathToAliasMap = pathToAliasMap
    this.source = 'described-resolve'
    this.target = 'resolve'

    this.registerExtractor(tsconfigExtractor)
  }

  private async findAlias(data: ResolveRequest) {
    const dataPath = data.path

    if (!dataPath) {
      return {}
    }

    // console.log('dataPath')
    // console.log(dataPath)
    // console.log(Object.keys(this.extractors))

    const aliasesArr: Record<string, string>[] = await asyncFlatMap(
      Object.keys(this.extractors),
      async (it: string) => {
        const locations = await memoizeFindUp(it, { cwd: dataPath })
        return locations.map(
          (it) => it && this.extractors[path.basename(it)] && this.extractors[path.basename(it)](it)
        )
      }
    )

    const result = {}
    aliasesArr.forEach((it) => {
      Object.assign(result, it)
    })

    return result
  }

  private async updateRequest(data: ResolveRequest) {
    const dataPath = data.path

    if (
      !data ||
      !data.request ||
      !dataPath ||
      this.options.ignore.find((it) => dataPath.includes(it))
    ) {
      return false
    }

    const requestSegements = data.request.split('/')
    const requestLocation = dataPath.replace(/\\/g, '/') + '/'

    const rootAlias = this.pathToAliasMap.get(requestLocation) || (await this.findAlias(data))
    const alias = Object.assign({}, this.defaultAlias, rootAlias || {})

    if (!alias[requestSegements[0]]) {
      return false
    }

    data.request =
      alias[requestSegements[0]] +
      (requestSegements.length > 1 ? path.sep + requestSegements.slice(1).join(path.sep) : '')

    return true
  }
}
