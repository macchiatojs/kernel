import Stream from 'stream'
import type { ServerResponse } from 'http'

import { EMPTY_BODY_STATUES } from './statues.util'
import { FLAG_OBJECT, FLAG_BUFFER, FLAG_STREAM, getFlag } from './flags.util'
import type Context from '../context'
import type { BodyContent } from '../types'

/**
 * response helper for .send().
 * 
 * @param {ServerResponse} rawResponse 
 * @param {BodyContent} body 
 * @return {ServerResponse|void}
 */
export function respondHook(rawResponse: ServerResponse, body: BodyContent = null): ServerResponse|void {
  // pick the right flag type of the body payload
  const flag = getFlag(body)

  // body is null
  if (body === null) {
    return rawResponse.end()
  }

  // set the content-type only if not yet set
  const needSetType = !rawResponse.headersSent && !rawResponse.getHeader('Content-Type')
  // force to set json as content type.
  const needSetJsonType = !rawResponse.headersSent && !rawResponse.hasHeader('Content-Length')

  // body is stream
  if (flag === FLAG_STREAM) {
    /* istanbul ignore next */
    if (needSetType) {
      rawResponse.setHeader('Content-Type', 'application/octet-stream')
    }

    return (body as Stream).pipe(rawResponse)
  }

  // body is buffer
  if (flag === FLAG_BUFFER) {
    if (needSetType) {
      rawResponse.setHeader('Content-Type', 'application/octet-stream')
    }

    return rawResponse.end(body)
  }

  // body is json
  if (flag === FLAG_OBJECT) {
    // https://github.com/koajs/koa/pull/1131/files
    if (needSetType || needSetJsonType) {
      rawResponse.setHeader('Content-Type', 'application/json')
    }

    body = JSON.stringify(body)
  }

  // body is string  (parsed number, boolean ... as string)
  rawResponse.end(`${body}`)
}

/**
 * response helper for main request hanlder.
 * 
 * @param {Context} context 
 * @return {void}
 */
export function respond({ rawResponse, response, request: { method } }: Context): void {
  if (
    // early respond when the respond is not writable
    !response.writable ||
    // https://github.com/koajs/koa/issues/1547
    /* istanbul ignore if */
    method === 'HEAD'
  ) return rawResponse.end()

  // ignore body
  if (EMPTY_BODY_STATUES.has(response.status)) {
    response.body = null
    return rawResponse.end()
  }

  // respond
  respondHook(rawResponse, response.body)
}
