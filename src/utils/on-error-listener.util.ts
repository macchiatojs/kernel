import type { ServerResponse } from 'http'
import HttpError from '@macchiatojs/http-error'

import type Context from '../context'
import type Kernel from '../kernel'
import { paramsFactory } from './params-factory.util'
import { writable } from './writable.util'

type onErrorListener = (app: Kernel, rawResponse: ServerResponse) => (context: Context) => void

/**
 * Error Handler used from the kernel as response afterware
 * and injected as coreware on response instance to handle
 * streams errors.
 *
 * @param {Error|HttpError|null} err
 * @return void
 */
export function onErrorListener(err?: Error | HttpError | null): onErrorListener {
  return (app: Kernel, rawResponse: ServerResponse) => {
    return (context: Context) => {
      // don't do anything if there is no error.
      if (!err) return

      /* istanbul ignore next */
      if (!HttpError.isHttpError(err)) err = new HttpError(err['code'], err.message, err)

      const headersSent =
        rawResponse.headersSent || !writable(rawResponse)
          ? (err as HttpError)['headersSent'] = true
          : false

      // emit error
      app.emit('error', err, ...paramsFactory(app.expressify, context))

      if (headersSent) return

      // clean header response
      rawResponse
        .getHeaderNames()
        .forEach((name) => rawResponse.removeHeader(name))

      /* istanbul ignore next */
      const { message, stack, expose } = err as HttpError
      /* istanbul ignore next */
      const statusCode = err['code'] === 'ENOENT' ? 404 : (err['status'] || err['statusCode'] || 500)
      /* istanbul ignore next */
      const messageContent = (app.dev ? !!stack && stack : !expose && `${statusCode}`) || message
      
      // prepare the response.
      rawResponse
        // force text/plain
        .writeHead(statusCode, {
          'content-length': Buffer.byteLength(messageContent),
          'content-type': 'text/plain',
        })
        // respond
        .end(messageContent)
    }
  }
}
