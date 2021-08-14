import Emitter from 'events'
import { Server } from 'http'
import type { IncomingMessage, ServerResponse } from 'http'
import Middleware from '@macchiatojs/middleware'
import KoaifyMiddleware from '@macchiatojs/koaify-middleware'
import HttpError from '@macchiatojs/http-error'
import onFinished from 'on-finished'

import Context from './context'
import type { MacchiatoMiddleware, onErrorHandler } from './types';
import { paramsFactory, respond, onErrorListener, WrapKoaCompose } from './utils'

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

  constructor(options?: { expressify?: boolean, koaCompose?: WrapKoaCompose }) {
    super()    
    this.expressify = options?.koaCompose ? false : options?.expressify ?? true    
    this.middleware = this.expressify 
      ? new Middleware()
      : /* istanbul ignore next */ options?.koaCompose ?? new KoaifyMiddleware()
    this.env = process.env.NODE_ENV || 'development'
    this.dev = this.env.startsWith('dev')
    this.config = new Map<string, unknown>([
      ['subdomain offset', 2],
      ['trust proxy', false]
    ])
  }

  use(fn: MacchiatoMiddleware) {
    this.middleware.push(fn)
    return this
  }

  #handleRequest() {
    return (req: IncomingMessage, res: ServerResponse) => {
      const context = new Context(this, this.config, req, res)
      const onError = (err?: HttpError|Error|null) => onErrorListener(err as any)(this, res)(context)
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

  stop(callback?: onErrorHandler) {
    if (this.#server) {
      this.#server.close(callback)
    }

    return this
  }

  reload(callback?: onErrorHandler, ...args) {
    return this.stop(callback).start(...args)
  }
}

export default Kernel
