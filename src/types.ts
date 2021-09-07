import type { Stream } from 'stream'
import type Context from './context'
import type Request from './request'
import type Response from './response'

/**
 * @types
 */
export type Next<T=unknown> = () => Promise<T>
export type KoaStyleHandler<C=Context, N=Next<unknown>, R=unknown> = (context: C, next: N) => R
export type ExpressStyleHandler<Req=Request, Res=Response, N=Next<unknown>, R=unknown> = (request: Req, response: Res, next: N) => R
export type MacchiatoHandler = ExpressStyleHandler|KoaStyleHandler
export type onErrorHandler<T = Error> = (err?: T) => void
export type KeyValueObject<T = unknown> = { [key:string]: T }
export type BodyContent<T= unknown[]|unknown> = string|number|boolean|Buffer|Stream|KeyValueObject|null|undefined|T
// super model for (Middleware/KoaifyMiddleware/WrapKoaCompose)
// TODO: make a behave to re-use this interface and fix types.
export interface MiddlewareEngine extends Array<MacchiatoHandler> {
  compose(...args: any): Promise<unknown>
}