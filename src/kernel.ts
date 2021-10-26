import EE from 'events'
import { Server } from 'http'
import type { IncomingMessage, ServerResponse } from 'http'
import Middleware from '@macchiatojs/middleware'
import KoaifyMiddleware from '@macchiatojs/koaify-middleware'
import WrapKoaCompose from '@macchiatojs/wrap-koa-compose'
import type HttpError from '@macchiatojs/http-error'

import Context from './context'
import type { MacchiatoHandler, Next, onErrorHandler, MiddlewareEngine } from './types'
import { paramsFactory, respond, onFinishedAfterware, onErrorListener } from './utils'

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

  constructor(options?: { expressify?: boolean, koaCompose?: WrapKoaCompose<Context, Next> }) {
    super()
    /**
     * Think to move Middleware Engine outside the kernel
     * and remove expressify option and force it by extract
     * the right behave.
     * 
     * ==> better to minify the kernel.
     */  
    this.expressify = options?.koaCompose ? false : options?.expressify ?? true    
    this.middleware = this.expressify 
      ? new Middleware<Request, Response>()
      : /* istanbul ignore next */ options?.koaCompose ?? new KoaifyMiddleware<Context>()
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

  reload(callback?: onErrorHandler, ...args: any): Server {
    return this.stop(callback).start(...args)
  }
}

export default Kernel
