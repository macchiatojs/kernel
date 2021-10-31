import type { Stream } from 'stream'

import type Context from './context'
import type Request from './request'
import type Response from './response'

/**
 * @types
 */
export type Next<T=unknown> = () => Promise<T>
export type KoaStyleHandler<C=Context, N=Next, R=unknown> = (context: C, next: N) => R
export type ExpressStyleHandler<Req=Request, Res=Response, N=Next, R=unknown> = (request: Req, response: Res, next: N) => R
export type MacchiatoHandler = ExpressStyleHandler|KoaStyleHandler
export type onErrorHandler<T = Error> = (err?: T) => void
export type KeyValueObject<T = unknown> = { [key:string]: T }
export type BodyContent<T= unknown[]|unknown> = string|number|boolean|Buffer|Stream|KeyValueObject|null|undefined|T
export interface MiddlewareEngine extends Array<MacchiatoHandler> {
  compose(...args: unknown[]): Promise<unknown>
}
