/**
 * @3imed-jaberi/http-error
 *
 * Copyright(c) 2021 Imed Jaberi
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 */

import { STATUS_CODES  } from 'http'

type TOrigin = { status?: number, statusCode?: number } | null

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
  public origin: TOrigin
  public expose: boolean

  // so much arity going on ~_~
  constructor(
    /* istanbul ignore next */
    code: number|string = 500,
    message = '',
    origin: TOrigin = null,
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
    this.expose = expose
    Error.captureStackTrace(this, this.constructor)
  }

  get name(): string {
    return 'HttpError'
  }
}

/**
* Expose `HttpError`.
*/

export default HttpError


// function createError () {
//   var err
//   var msg
//   var status = 500
//   var props = {}
//   for (var i = 0; i < arguments.length; i++) {
//     var arg = arguments[i]
//     if (arg instanceof Error) {
//       err = arg
//       status = err.status || err.statusCode || status
//       continue
//     }
//     switch (typeof arg) {
//       case 'string':
//         msg = arg
//         break
//       case 'number':
//         status = arg
//         if (i !== 0) {
//           deprecate('non-first-argument status code; replace with createError(' + arg + ', ...)')
//         }
//         break
//       case 'object':
//         props = arg
//         break
//     }
//   }

//   if (typeof status === 'number' && (status < 400 || status >= 600)) {
//     deprecate('non-error status code; use only 4xx or 5xx status codes')
//   }

//   if (typeof status !== 'number' ||
//     (!statuses[status] && (status < 400 || status >= 600))) {
//     status = 500
//   }

//   // constructor
//   var HttpError = createError[status] || createError[codeClass(status)]

//   if (!err) {
//     // create error
//     err = HttpError
//       ? new HttpError(msg)
//       : new Error(msg || statuses[status])
//     Error.captureStackTrace(err, createError)
//   }

//   if (!HttpError || !(err instanceof HttpError) || err.status !== status) {
//     // add properties to generic error
//     err.expose = status < 500
//     err.status = err.statusCode = status
//   }

//   for (var key in props) {
//     if (key !== 'status' && key !== 'statusCode') {
//       err[key] = props[key]
//     }
//   }

//   return err
// }