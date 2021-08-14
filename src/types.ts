import type Context from './context'
import type Request from './request'
import type Response from './response'

/**
 * @types
 */
export type Next<T=any> = () => Promise<T>;
export type KoaStyleMiddleware<C=Context, N=Next<any>, R=any> = (context: C, next: N) => R
export type ExpressStyleMiddleware<Req=Request, Res=Response, N=Next<any>, R=any> = (request: Req, response: Res, next: N) => R
export type MacchiatoMiddleware = ExpressStyleMiddleware|KoaStyleMiddleware
export type onErrorHandler<T = Error> = (err?: T) => void
