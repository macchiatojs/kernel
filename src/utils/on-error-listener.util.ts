import type { ServerResponse } from 'http'
import HttpError from '@macchiatojs/http-error'

import type Context from '../context'
import type Kernel from '../kernel'
import { paramsFactory } from './params-factory.util'
import { writable } from './writable.util'

/**
 * Error Handler used from the kernel as response afterware
 * and injected as coreware on response instance to handle
 * streams errors.
 *
 * @param {Error|HttpError|null} err
 * @return void
 */
export function onErrorListener(err: Error | HttpError | null): (app: Kernel, rawResponse: ServerResponse) => (context: Context) => void {
  return (app: Kernel, rawResponse: ServerResponse) => {
    return (context: Context) => {
      // don't do anything if there is no error.
      if (err === null) return

      if (!HttpError.isHttpError(err)) {
        /* istanbul ignore next */
        err = new HttpError(err['code'], err.message, err)
      }

      const headersSent =
        rawResponse.headersSent || !writable(rawResponse)
          ? (err['headersSent'] = true)
          : false

      // emit error
      app.emit('error', err, ...paramsFactory(app.expressify, context))

      if (headersSent) return

      rawResponse
        .getHeaderNames()
        .forEach((name) => rawResponse.removeHeader(name))

      /* istanbul ignore next */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let { message = 'Internal Server Error', stack, expose } = err as any // eslint-disable-line prefer-const
      /* istanbul ignore next */
      let statusCode = err['status'] || err['statusCode'] || 500
      /* istanbul ignore next */
      message = app.dev ? stack : expose ? message : `${statusCode}`

      if (err['code'] === 'ENOENT') statusCode = 404

      // force text/plain
      rawResponse.writeHead(statusCode, {
        'content-length': Buffer.byteLength(message),
        'content-type': 'text/plain',
      })

      // respond
      rawResponse.end(message)
    }
  }
}
