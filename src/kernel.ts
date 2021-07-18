import { Server, IncomingMessage, ServerResponse } from 'http'
import KoaifyMiddleware from '@macchiatojs/koaify-middleware'
import Middleware from '@macchiatojs/middleware'
import HttpError from '@macchiatojs/http-error'
import onFinished from 'on-finished'
import Emitter from 'events'

import { paramsFactory, send, sendError, WrapKoaCompose } from './utils'
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
  emptyBodyStatues: Set<number>

  constructor(options?: { expressify?: boolean, koaCompose?: any }) {
    super()
    this.emptyBodyStatues = new Set([204, 205, 304])
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
    if (typeof fn !== 'function') {
      throw new TypeError('middleware must be a function!')
    }

    this.middleware.push(fn)
    return this
  }

  #handleRequest(req: IncomingMessage, res: ServerResponse) {
    const context = new Context(this, this.config, req, res)
    const onError = (err: HttpError|Error|null) => {
      if (!err) return

      if (!HttpError.isHttpError(err)) {
        err = new HttpError((err as any)?.code, err.message, err)
      }

      sendError(res, err, this.dev)
      this.emit('error', err, ...paramsFactory(this.expressify, context))
    }
    const handleResponse = () => this.#respond(context)

    onFinished(res, (context.response.onError = onError))

    // invoke
    return (
      this.middleware.compose(
        ...paramsFactory(this.expressify, context)
      ).then(handleResponse).catch(onError)
    )
  }

  #respond({ rawResponse, response, request: { method } }: Context) {
    /* istanbul ignore next */
    if (!response.writable) return

    // ignore body
    if (this.emptyBodyStatues.has(response.status)) {
      // strip headers
      response.body = null
      return rawResponse.end()
    }

    if (method === 'HEAD') {
      return rawResponse.end()
    }

    send(rawResponse, response.body, response.flag, response.onError)
  }

  start(...args) {
    if (!this.#server) this.#server = new Server()
    this.#server.on('request', (req: IncomingMessage, res: ServerResponse) => this.#handleRequest(req, res))
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
