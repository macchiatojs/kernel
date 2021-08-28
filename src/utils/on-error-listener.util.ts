import HttpError from '@macchiatojs/http-error'
import type { ServerResponse } from 'http'
import type Context from '../context'
import type Kernel from '../kernel'
import { paramsFactory } from './params-factory.util'
import { writable } from './writable.util'

//
export function onErrorListener(err: Error|HttpError|null): (app: Kernel, rawResponse: ServerResponse) => (context: Context) => void {
  return (app: Kernel, rawResponse: ServerResponse) => {
    return (context: Context) => {
      // don't do anything if there is no error.
      if (err === null) return

      if (!HttpError.isHttpError(err)) {
        /* istanbul ignore next */
        err = new HttpError(err['code'], err.message, err)
      }

      let headersSent = false
      if (rawResponse.headersSent || !writable(rawResponse)) {
        headersSent = err['headersSent'] = true
      }

      // emit error 
      app.emit('error', err, ...paramsFactory(app.expressify, context))

      if (headersSent) return

      rawResponse.getHeaderNames().forEach(name => rawResponse.removeHeader(name))

      /* istanbul ignore next */
      let { message = 'Internal Server Error', stack, expose } = err as any // eslint-disable-line prefer-const
      /* istanbul ignore next */
      let statusCode = err['status'] || err['statusCode'] || 500
      /* istanbul ignore next */
      message = app.dev ? stack : (expose ? message : `${statusCode}`)

      if (err['code'] === 'ENOENT') statusCode = 404

      // force text/plain
      rawResponse.writeHead(statusCode, {
        'content-length': Buffer.byteLength(message),
        'content-type': 'text/plain'
      })

      // respond
      rawResponse.end(message)
    }
  }
}
