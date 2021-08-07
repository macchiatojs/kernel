import { Server, IncomingMessage, ServerResponse } from 'http'
import KoaifyMiddleware from '@macchiatojs/koaify-middleware'
import Middleware from '@macchiatojs/middleware'
import HttpError from '@macchiatojs/http-error'
import onFinished from 'on-finished'
import Emitter from 'events'

import { paramsFactory, respond, onErrorListener, WrapKoaCompose } from './utils'
import Context from './context'
import Request from './request'
import Response from './response'

/**
 * @types
 */
export type Next = () => Promise<any>;
export type KoaStyleMiddleware<Context> = (context: Context, next: Next) => any
export type ExpressStyleMiddleware<Request, Response> = (request: Request, response: Response, next: Next) => any
export type MacchiatoMiddleware = ExpressStyleMiddleware<Request, Response>|KoaStyleMiddleware<Context>

/**
 * Kernel
 *
 * @class Kernel
 * @extends Emitter
 * @api public
 */
class Kernel extends Emitter {
  #server!: Server
  expressify: boolean
  env: string
  dev: boolean
  middleware: any
  config: Map<string, unknown>

  constructor(options?: { expressify?: boolean, koaCompose?: any }) {
    super()
    this.expressify = options?.expressify ?? true
    this.env = process.env.NODE_ENV || 'development'
    this.dev = this.env.startsWith('dev')
    this.config = new Map<string, unknown>([['subdomain offset', 2], ['trust proxy', false]])
    // this.middleware = this.expressify ? new Middleware() : new KoaifyMiddleware()
    if (options?.koaCompose) {
      this.expressify = false
      this.middleware = new WrapKoaCompose(options.koaCompose)
    } else {
      this.middleware = this.expressify ? new Middleware() : new KoaifyMiddleware()
    }
  }

  use(fn: MacchiatoMiddleware) {
    this.middleware.push(fn)
    return this
  }

  #handleRequest() {
    return (req: IncomingMessage, res: ServerResponse) => {
      const context = new Context(this, this.config, req, res)
      const onError = (err: HttpError|Error|null) => { onErrorListener(err)(this, res)(context) }
      const handleResponse = () => respond(context)

      onFinished(res, (context.response.onError = onError))

      // invoke
      return (
        this.middleware.compose(
          ...paramsFactory(this.expressify, context)
        ).then(handleResponse).catch(onError)
      )
    }
  }

  start(...args) {
    if (!this.#server) this.#server = new Server()
    this.#server.on('request', this.#handleRequest())
    return this.#server.listen(...args)
  }

  stop(callback?: (err?: Error) => void) {
    if (this.#server) {
      this.#server.close(callback)
    }

    return this
  }

  reload(callback?: (err?: Error) => void, ...args) {
    return this.stop(callback).start(...args)
  }
}

export default Kernel
