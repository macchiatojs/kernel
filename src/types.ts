import type { Stream } from 'stream'
import type Context from './context'
import type Request from './request'
import type Response from './response'
import type { WrapKoaCompose } from './utils'

/**
 * @types
 */
export type Next<T=unknown> = () => Promise<T>
export type KoaStyleMiddleware<C=Context, N=Next<unknown>, R=unknown> = (context: C, next: N) => R
export type ExpressStyleMiddleware<Req=Request, Res=Response, N=Next<unknown>, R=unknown> = (request: Req, response: Res, next: N) => R
export type MacchiatoMiddleware = ExpressStyleMiddleware|KoaStyleMiddleware|WrapKoaCompose
export type onErrorHandler<T = Error> = (err?: T) => void
export type KeyValueObject<T = unknown> = { [key:string]: T }
export type BodyContent<T= unknown[]|unknown> = string|number|boolean|Buffer|Stream|KeyValueObject|null|undefined|T
