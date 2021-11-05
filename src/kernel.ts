/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import EE from 'events'
import { Server } from 'http'
import type { ListenOptions } from 'net'
import type { IncomingMessage, ServerResponse } from 'http'
import type WrapKoaCompose from '@macchiatojs/wrap-koa-compose'
import type HttpError from '@macchiatojs/http-error'

import Context from './context'
import type { 
  Next,
  onErrorHandler,
  MacchiatoHandler,
  MiddlewareEngine,
  GetContentTypeHandler,
} from './types'
import { 
  respond,
  paramsFactory,
  onErrorListener,
  onFinishedAfterware,
  pickMiddlewareEngine
} from './utils'

/**
 * Kernel
 *
 * @class Kernel
 * @extends Emitter
 * @api public
 */
class Kernel extends EE {
  #server!: Server
  expressify: boolean
  env: string
  dev: boolean
  middleware: MiddlewareEngine
  config: Map<string, unknown>
  __getType?: GetContentTypeHandler

  // TODO: 
  // - make some external module to handle thinks like sendFile and render. 
  //   ---> sendFile (fs.createReadStream(srcFilepath).pipe(res -res.writeHead(200, headers)-))
  // - make some external logger module.
  // - make some external session module.
  // - make some external session providers modules (redis, mongodb, sql).
  // - make some external views module based on consolidate (+15 views engine).
  // - make some external views module based on ejs or jade as principle template engine support.
  // - make some external views module based my costum jsx template engine.
  // - add ajv support.

  constructor(options?: { 
    expressify?: boolean,
    // middlewares: MacchiatoHandler[],
    getContentType?: GetContentTypeHandler
    koaCompose?: WrapKoaCompose<Context, Next>
  }) {
    super()
    // TODO: 
    // - migrate to use process.env for configuration.
    // - inject the options to process.env with some prefix like 'MACCHIATO_CONFIG_*'
    this.expressify = options?.koaCompose ? false : options?.expressify ?? true    
    this.middleware = pickMiddlewareEngine(this.expressify, options?.koaCompose)
    // // TODO: add support for some middlewares through the start behave.
    // if(options?.middlewares?.length !== 0) {
    //   for (const middleware of options?.middlewares as MacchiatoHandler[]) {
    //     this.middleware.push(middleware)
    //   }
    // }
    this.__getType = options?.getContentType
    this.env = process.env.NODE_ENV || 'development'
    this.dev = this.env.startsWith('dev')
    this.config = new Map<string, unknown>([
      ['subdomain offset', 2],
      ['trust proxy', false]
    ])
  }

  use(fn: MacchiatoHandler): Kernel {
    this.middleware.push(fn)
    return this
  }

  #handleRequest() {
    return (req: IncomingMessage, res: ServerResponse): Promise<Next|void>|void => {
      const context = new Context(this, this.config, req, res)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const onError: onErrorHandler<Error|HttpError|null> = (err?: Error|HttpError|null): void => onErrorListener(err!)(this, res)(context)
      const handleResponse = () => respond(context)

      onFinishedAfterware(res, context.response.onError = onError)

      // invoke
      return (
        this.middleware.compose(
          ...paramsFactory(this.expressify, context)
        ).then(handleResponse).catch(onError)
      )
    }
  }

  start(port?: number, hostname?: string, backlog?: number, listeningListener?: () => void): Server
  start(port?: number, hostname?: string, listeningListener?: () => void): Server
  start(port?: number, backlog?: number, listeningListener?: () => void): Server
  start(port?: number, listeningListener?: () => void): Server
  start(path: string, backlog?: number, listeningListener?: () => void): Server
  start(path: string, listeningListener?: () => void): Server
  start(options: ListenOptions, listeningListener?: () => void): Server
  start(handle: any, backlog?: number, listeningListener?: () => void): Server
  start(handle: any, listeningListener?: () => void): Server
  start(...args: any): Server {
    if (!this.#server) this.#server = new Server()
    this.#server.on('request', this.#handleRequest())
    return this.#server.listen(...args)
  }

  stop(callback?: onErrorHandler): Kernel {
    if (this.#server) {
      this.#server.close(callback)
    }

    return this
  }

  reload(callback?: onErrorHandler, port?: number, hostname?: string, backlog?: number, listeningListener?: () => void): Server
  reload(callback?: onErrorHandler, port?: number, hostname?: string, listeningListener?: () => void): Server
  reload(callback?: onErrorHandler, port?: number, backlog?: number, listeningListener?: () => void): Server
  reload(callback?: onErrorHandler, port?: number, listeningListener?: () => void): Server
  reload(callback?: onErrorHandler, path?: string, backlog?: number, listeningListener?: () => void): Server
  reload(callback?: onErrorHandler, path?: string,  listeningListener?: () => void): Server
  reload(callback?: onErrorHandler, options?: ListenOptions, listeningListener?: () => void): Server
  reload(callback?: onErrorHandler, handle?: any, backlog?: number, listeningListener?: () => void): Server
  reload(callback?: onErrorHandler, handle?: any, listeningListener?: () => void): Server
  reload(callback?: onErrorHandler, ...args: any): Server {
    return this.stop(callback).start(...args)
  }
}

export default Kernel
