import type Context from '../context'
import type { Next } from '../types'

// wrap the koa-compose module to be with same used behaviour
export class WrapKoaCompose extends Array {
  #koaCompose

  constructor(koaCompose) {
    super()
    this.#koaCompose = koaCompose
  }

  compose(ctx: Context, next?: Next) {
    return this.#koaCompose(this)(ctx, next)
  }
}
