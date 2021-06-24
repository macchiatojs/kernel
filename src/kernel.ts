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

  constructor(options?: { expressify?: boolean, koaCompose?: any }) {
    super()
    this.expressify = options?.expressify ?? true
    this.env = process.env.NODE_ENV || 'development'
    this.dev = this.env.startsWith('dev')
    if (options?.koaCompose) {
      this.expressify = false
      this.middleware = new WrapKoaCompose(options.koaCompose)
    } else {
      this.middleware = this.expressify ? new Middleware() : new KoaifyMiddleware()
    }
    this.config = new Map<string, unknown>([['subdomain offset', 2], ['trust proxy', false]])
  }

  use(fn: MacchiatoMiddleware) {
    // if (typeof fn !== 'function')
    //   throw new TypeError('middleware must be a function!')

    this.middleware.push(fn)
    return this
  }

  #handle(req: IncomingMessage, res: ServerResponse) {
    const context = new Context(this, this.config, req, res)
  
    const onError = (err: HttpError | Error | null) => {
      if (!err) return

      if (!HttpError.isHttpError(err)) {
        err = new HttpError((err as any)?.code, err.message, err)
      }

      sendError(res, err, this.dev)
      // this.emit('error', err, ...paramsFactory(this.expressify, context))
      this.emit.apply(this, ['error', err, ...paramsFactory(this.expressify, context)])
    }
  
    onFinished(res, (context.response.onError = onError))
    return this.#invoke(context, onError)
  }

  #invoke(
    context: Context,
    onError: (err?: any) => void
  ) {
    const handleResponse = () => this.#respond(context)

    return this.middleware
      .compose(...paramsFactory(this.expressify, context))
      .then(handleResponse)
      .catch(onError)
  }

  #respond(context: Context) {
    /* istanbul ignore next */
    if (!context.response.writable) return

    // ignore body
    if ('204 205 304'.includes(`${context.response.status}`)) {
      // strip headers
      context.response.body = null
      return context.rawResponse.end()
    }

    if (context.request.method === 'HEAD') {
      // if (!rawResponse.headersSent && !response.has('Content-Length')) {
      //   if (Number.isInteger(length)) response.length = length;
      // }
      return context.rawResponse.end()
    }

    send(context.rawResponse, context.response.body, context.response.flag, context.response.onError)
  }

  start(...args) {
    if (!this.#server) this.#server = new Server()
    const handleRequest = (req: IncomingMessage, res: ServerResponse) => this.#handle(req, res)
    this.#server.on('request', handleRequest)
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
