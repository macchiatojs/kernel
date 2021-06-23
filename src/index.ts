/**
 * @macchiatojs/http-error
 *
 * Copyright(c) 2021 Imed Jaberi
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 */

import { STATUS_CODES  } from 'http'

type originType = { status?: number, statusCode?: number } | null

/**
 * HttpError
 *
 * @class HttpError
 * @extends Error
 * @param {Number|String} code
 * @param {String} message
 * @param {Object} origin
 * @param {Boolean} expose
 * @api public
 */
class HttpError extends Error  {
  // init attributes
  public code: number|string
  public status: string
  public message: string
  public origin: originType
  public expose: boolean

  // so much arity going on ~_~
  constructor(
    /* istanbul ignore next */
    code: number|string = 500,
    message = '',
    origin: originType = null,
    expose = false
  ) {
    super()

    let status

    if (origin) status = origin.status || origin.statusCode

    if (!status) status = code === 'ENOENT' ? 404 : code

    this.code = code
    this.status = status in STATUS_CODES ? status : 500
    this.message = message || STATUS_CODES[status] || 'unknown'
    this.origin = origin
    // Determines if details about the error should be automatically exposed in a response.
    this.expose = expose
    Error.captureStackTrace(this, this.constructor)
  }

  get name(): string {
    return 'HttpError'
  }

  static isHttpError (value: unknown): boolean {
    return value instanceof HttpError
  }
}


/**
* Expose `isHttpError`.
*/
export function isHttpError(value: unknown): boolean {
  return value instanceof HttpError
}

/**
* Expose `HttpError`.
*/

export default HttpError
