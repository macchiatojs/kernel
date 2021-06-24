import { contentType as getType } from 'mime-types'
import HttpError from '@macchiatojs/http-error'
import { ServerResponse } from 'http'
import hashlruCache  from 'hashlru'
import Stream from 'stream'
import Context from './context'

// cache use to improve the mime type fetch process.
const typeHashlruCache = hashlruCache(100);

// body type flags
export const FLAG_STRING = 0
export const FLAG_OBJECT = 1
export const FLAG_BUFFER = 2
export const FLAG_STREAM = 4

// determine the right flag for the current body.
export function getFlag(body: unknown) {
  if (!body || typeof body === 'string') return FLAG_STRING
  if (Buffer.isBuffer(body)) return FLAG_BUFFER
  if (body instanceof Stream) return FLAG_STREAM
  return FLAG_OBJECT
}

// determine the length the current body.
export function getLength(body: unknown, flag = FLAG_STRING) {
  if (!body) return 0
  if (flag === FLAG_STRING) return Buffer.byteLength(body as string)
  if (flag === FLAG_OBJECT) return Buffer.byteLength(JSON.stringify(body))
  if (flag === FLAG_BUFFER) return (body as Buffer).length
}

//
export function send(
  response: ServerResponse,
  body: unknown = null,
  flag = FLAG_STRING,
  onError: (err: HttpError|Error) => void
) {
  // body is null
  if (body === null) {
    return response.end()
  }

  // set the content-type only if not yet set
  const needSetType = !response.headersSent && !response.getHeader('content-type')
  // force to set json as content type.
  const needSetJsonType = !response.headersSent && !response.hasHeader('Content-Length')

  // body is stream
  if (flag === FLAG_STREAM) {
    if (needSetType) {
      response.setHeader('content-type', 'application/octet-stream')
    }
    // Track fs.createReadStream('not-file-exists')
    if (!(body as Stream).listeners('error').includes(onError)) (body as Stream).on('error', onError)
    return (body as Stream).pipe(response)
  }

  // body is buffer
  if (flag === FLAG_BUFFER) {
    if (needSetType) {
      response.setHeader('content-type', 'application/octet-stream')
    }

    return response.end(body as Buffer)
  }

  // body is json
  if (flag === FLAG_OBJECT) {
    // https://github.com/koajs/koa/pull/1131/files
    if (needSetType || needSetJsonType) {
      response.setHeader('content-type', 'application/json')
    }

    body = JSON.stringify(body)
  }

  // body is string  (parsed number, boolean ... as string)
  response.end(`${body}`)
}

//
export function sendError(
  response: ServerResponse,
  err: HttpError | Error,
  __DEV__: boolean,
  headersSent = false
) {
  if (response.headersSent || !writable(response)) {
    headersSent = true
    ;(err as any).headersSent = true
  }

  if (headersSent) return

  const { status = 500, stack, expose } = err as any
  let { message } = err
  message = 'Internal Server Error'
  message = __DEV__ ? stack : (expose ? message : String(status))

  // force text/plain
  const headerText = {
    'content-length': Buffer.byteLength(message),
    'content-type': 'text/plain'
  }

  response.writeHead(status, headerText)
  response.end(message)
}

//
export function writable(response: ServerResponse) {
  // can't write any more after response finished
  if (
    response.writableEnded
    // || response.responded
  ) return false

  const socket = response.socket
  // there are already pending outgoing response, but still writable
  // https://github.com/nodejs/node/blob/v14.17.0/lib/_http_server.js#L865
  if (!socket) return true
  return socket.writable
}

// wrap the koa-compose module to be with same used behaviour
export class WrapKoaCompose extends Array {
  #koaCompose

  constructor(koaCompose) {
    super()
    this.#koaCompose = koaCompose
  }

  compose(ctx, next?) {
    return this.#koaCompose(this)(ctx, next)
  }
}

// return the correct params as array (then you can spread it)
export function paramsFactory (expressify: boolean, context: Context) {
  const params = expressify 
    ? [context.request, context.response]
    : [context]

  return params
}

// better performance than getType.
export function getMimeType(type:string) {
  let mimeType = typeHashlruCache.get(type)

  if (!mimeType) {
    mimeType = getType(type) as string
    typeHashlruCache.set(type, mimeType);
  }

  return mimeType
}
