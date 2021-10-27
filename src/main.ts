import path from 'path'
import memoize from 'lodash.memoize'
import { findUpMultiple } from 'find-up'
import asyncFlatMap from 'async/flatMap'
import { PLUGIN_NAME } from './env'
import { extractor as tsconfigExtractor } from './extractors/tsconfig'
import { ResolvePluginInstance, Resolver, ResolveRequest } from './types/plugin'

type HandlerT = (arg: string) => Record<string, string>

const memoizeFindUp = memoize(findUpMultiple, (...arg: any[]) => arg.join(''))

export class FileAlias implements ResolvePluginInstance {
  extractors: Record<string, HandlerT> = {}
  defaultAlias: Record<string, string>
  options: { ignore: string[] }
  pathToAliasMap: Map<string, Record<string, string>>
  source: string
  target: string

  registerExtractor(extractor: { name: string; handler: HandlerT }) {
    this.extractors[extractor.name] = extractor.handler
  }

  apply(resolver: Resolver) {
    const target = resolver.ensureHook(this.target)
    resolver.getHook(this.source).tapAsync(PLUGIN_NAME, async (data, resolveContext, callback) => {
      if (await this.updateRequest(data)) {
        resolver.doResolve(target, data, null, resolveContext, callback)
        return
      }
      callback()
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

    const aliasesArr: Record<string, string>[] = await asyncFlatMap(
      Object.keys(this.extractors),
      async (it: string) =>
        (
          await memoizeFindUp(it, { cwd: dataPath })
        ).map(
          (it) => it && this.extractors[path.basename(it)] && this.extractors[path.basename(it)](it)
        )
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
