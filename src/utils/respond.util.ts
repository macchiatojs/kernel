import Stream from 'stream'
import { EMPTY_BODY_STATUES } from './statues.util'
import { FLAG_OBJECT, FLAG_BUFFER, FLAG_STREAM, getFlag } from './flags.utils'
import type Context from '../context'
import type { ServerResponse } from 'http'

// response helper for .send()
export function respondHook(rawResponse: ServerResponse, body: any = null) {
  // 
  const flag = getFlag(body)

  // body is null
  if (body === null) {
    return rawResponse.end()
  }

  // set the content-type only if not yet set
  const needSetType = !rawResponse.headersSent && !rawResponse.getHeader('content-type')
  // force to set json as content type.
  const needSetJsonType = !rawResponse.headersSent && !rawResponse.hasHeader('Content-Length')

  // body is stream
  if (flag === FLAG_STREAM) {
    /* istanbul ignore next */
    if (needSetType) {
      rawResponse.setHeader('content-type', 'application/octet-stream')
    }

    return (body as Stream).pipe(rawResponse)
  }

  // body is buffer
  if (flag === FLAG_BUFFER) {
    if (needSetType) {
      rawResponse.setHeader('content-type', 'application/octet-stream')
    }

    return rawResponse.end(body)
  }

  // body is json
  if (flag === FLAG_OBJECT) {
    // https://github.com/koajs/koa/pull/1131/files
    if (needSetType || needSetJsonType) {
      rawResponse.setHeader('content-type', 'application/json')
    }

    body = JSON.stringify(body)
  }

  // body is string  (parsed number, boolean ... as string)
  rawResponse.end(`${body}`)
}

// response helper for main request hanlder.
export function respond({ rawResponse, response, request: { method } }: Context) {
  //
  if (!response.writable) return

  // ignore body
  if (EMPTY_BODY_STATUES.has(response.status)) {
    // strip headers
    response.body = null
    return rawResponse.end()
  }

  //
  /* istanbul ignore if */
  if (method === 'HEAD') {
    return rawResponse.end()
  }

  //
  respondHook(rawResponse, response.body)
}