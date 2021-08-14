import HttpError from '@macchiatojs/http-error'
import { paramsFactory } from "./params-factory.util"
import { writable } from "./writable.util"

//
export function onErrorListener (err: HttpError|Error|null) {
  return (app, rawResponse) => {
    return (context) => {
      // don't do anything if there is no error.
      if (err === null) return

      if (!HttpError.isHttpError(err)) {
        /* istanbul ignore next */
        err = new HttpError((err as any)?.code, err.message, err)
      }

      let headersSent = false
      if (rawResponse.headersSent || !writable(rawResponse)) {
        headersSent = (err as any).headersSent = true
      }

      // emit error 
      app.emit('error', err, ...paramsFactory(app.expressify, context))

      if (headersSent) return

      rawResponse.getHeaderNames().forEach(name => rawResponse.removeHeader(name))

      /* istanbul ignore next */
      let { message = 'Internal Server Error', stack, expose } = err as any // eslint-disable-line prefer-const
      /* istanbul ignore next */
      let statusCode = (err as any).status || (err as any).statusCode || 500
      /* istanbul ignore next */
      message = app.dev ? stack : (expose ? message : `${statusCode}`)

      if ((err as any).code === 'ENOENT') statusCode = 404;

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
