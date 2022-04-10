import EE from 'events'
import { Server } from 'http'
import type { ListenOptions } from 'net'
import type { IncomingMessage, ServerResponse } from 'http'
import type WrapKoaCompose from '@macchiatojs/wrap-koa-compose'
import type HttpError from '@macchiatojs/http-error'
import type { ViewEngineSettings } from '@macchiatojs/views'

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

  // TODO: 
  // - make some external session module.
  // - make some external session providers modules (redis, mongodb, sql).
  // - add ajv support.
  // - think to use SWC 🐱‍🐉.

  constructor(options?: { 
    expressify?: boolean,
    viewEngineConfig?: ViewEngineSettings,
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
    this.env = process.env.NODE_ENV || 'development'
    this.dev = this.env.startsWith('dev')
    this.config = new Map<string, unknown>([
      ['subdomain offset', 2],
      ['trust proxy', false],
      ['view engine', {
        root: 'views',
        viewExt: 'html',
        ...options?.viewEngineConfig
      }],
    ])
    this.config['getContentType'] = options?.getContentType
  }

  use(fn: MacchiatoHandler): Kernel {
    this.middleware.push(fn)
    return this
  }

  #handleRequest() {
    return (req: IncomingMessage, res: ServerResponse): Promise<Next|void>|void => {
      const context = new Context(this, this.config, req, res)
      const onError: onErrorHandler<Error|HttpError|null> = (err?) => onErrorListener(err)(this, res)(context)
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

  start(port?: number, hostname?: string, listeningListener?: () => void): Server
  start(port?: number, listeningListener?: () => void): Server
  start(options: ListenOptions, listeningListener?: () => void): Server
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  start(...args: any): Server {
    if (!this.#server) this.#server = new Server()
    this.#server.on('request', this.#handleRequest())
    return this.#server.listen(...args)
  }

  stop(callback?: onErrorHandler): Kernel {
    if (!this.#server) console.warn('We cann\'t find the server instance. you should start the server first');
    else this.#server.close(callback)
    return this
  }

  reload(callback?: onErrorHandler, port?: number, hostname?: string, listeningListener?: () => void): Server
  reload(callback?: onErrorHandler, port?: number, listeningListener?: () => void): Server
  reload(callback?: onErrorHandler, options?: ListenOptions, listeningListener?: () => void): Server
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reload(callback?: onErrorHandler, ...args: any): Server {
    return this.stop(callback).start(...args)
  }
}

export default Kernel
