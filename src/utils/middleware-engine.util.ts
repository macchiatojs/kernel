import Middleware from '@macchiatojs/middleware'
import KoaifyMiddleware from '@macchiatojs/koaify-middleware'
import type WrapKoaCompose from '@macchiatojs/wrap-koa-compose'

import type { Context, Request, Response, Next, MiddlewareEngine } from '..'

/**
 * pick the correct middleware engine.
 *
 * @param {boolean} expressify
 * @param {WrapKoaCompose<Context, Next>} koaComposeEngine
 * @return {MiddlewareEngine}
 */
export function pickMiddlewareEngine(
  expressify: boolean,
  koaComposeEngine?: WrapKoaCompose<Context, Next>
): MiddlewareEngine {
  return expressify
    ? new Middleware<Request, Response>()
    : /* istanbul ignore next */ koaComposeEngine ??
        new KoaifyMiddleware<Context>()
}
