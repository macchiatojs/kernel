import type { Stream } from 'stream'
import type { TLSSocket } from 'tls'
import { STATUS_CODES as statuses } from 'http'
import type { OutgoingHttpHeaders, ServerResponse } from 'http'
import { existsSync, createReadStream } from 'fs'
import { stat } from 'fs/promises'
import type { PathLike } from 'fs'
import { extname } from 'path'
import assert from 'assert'
import { is as typeIs } from 'type-is'
import contentDisposition from 'content-disposition'
import HttpError from '@macchiatojs/http-error'
import vary from 'vary'
import ViewEngine from '@macchiatojs/views'
import type { ViewEngineSettings } from '@macchiatojs/views'
import type Cookies from 'cookies'

import type Kernel from './kernel'
import type Request from './request'
import type { BodyContent, KeyValueObject, onErrorHandler, GetContentTypeHandler } from './types'
import {
  getFlag,
  writable,
  getLength,
  getMimeType,
  respondHook,
  FLAGS,
  EMPTY_BODY_STATUES
} from './utils'

type toJSON = {
  status: number,
  message: string,
  headers: OutgoingHttpHeaders
  body?: BodyContent
}

/**
 * Response
 *
 * @class Response
 * @param {ServerResponse} response
 * @api public
 */
class Response {
  #app!: Kernel
  #rawResponse: ServerResponse
  #request!: Request
  #BODY: BodyContent
  config!: Map<string, unknown>
  #cookies!: Cookies
  #viewEngineInstance!: ViewEngine
  flag!: number
  onError!: onErrorHandler<Error | HttpError | null>

  constructor(rawResponse: ServerResponse) {
    this.#rawResponse = rawResponse
  }

  /**
   * Initialize.
   *
   * @param {object} config
   * @param {Request} request
   * @api private
   */
  initialize(app: Kernel, config: Map<string, unknown>, request: Request, cookies: Cookies): void {
    this.#app = app
    this.config = config
    this.#request = request
    this.#cookies = cookies
    this.#viewEngineInstance = new ViewEngine(
      this.config.get('view engine') as ViewEngineSettings
    )
  }

  /**
   * Return the request socket.
   *
   * @return {Connection}
   * @api public
   */
  public get socket(): TLSSocket {
    return this.#request.socket as TLSSocket
  }

  /**
   * Return the raw response.
   *
   * @return {ServerResponse}
   * @api public
   */
  public get raw(): ServerResponse {
    /* istanbul ignore next */
    return this.#rawResponse
  }

  /**
   * Get response status code.
   *
   * @return {number}
   * @api public
   */
  public get status(): number {
    return this.#rawResponse.statusCode
  }

  /**
   * Set response status code.
   *
   * @param {number} code
   * @api public
   */
  public set status(code: number) {
    assert(typeof code === 'number', 'status code must be a number')
    const message = statuses[code]
    assert(message, `invalueid status code: ${code}`)
    assert(!this.#rawResponse.headersSent, 'headers have already been sent')
    this.#rawResponse.statusCode = code
    this.#rawResponse.statusMessage = message
  }

  /**
   * Get response status message.
   *
   * @return {string}
   * @api public
   */
  public get message(): string {
    return this.#rawResponse.statusMessage
  }

  /**
   * Set response status message.
   *
   * @param {string} msg
   * @api public
   */
  public set message(msg: string) {
    this.#rawResponse.statusMessage = msg
  }

  /**
   * Get response body.
   *
   * @return {Mixed}
   * @api public
   */
  public get body(): BodyContent {
    return this.#BODY
  }

  /**
   * Set response body.
   *
   * @param {string|number|Buffer|object|stream|null|undefined} value
   * @api public
   */
  public set body(value: BodyContent) {
    this.#BODY = value

    if (this.#rawResponse.headersSent) return

    // no content
    if (value === null) {
      if (!EMPTY_BODY_STATUES.has(this.status)) this.status = 204
      this.remove('Content-Type')
      this.remove('Content-Length')
      this.remove('Transfer-Encoding')
      return
    }

    this.flag = getFlag(value)

    // stream
    if (this.flag === FLAGS.Stream) {
      /* istanbul ignore next */
      if (!new Set((value as Stream).listeners('error')).has(this.onError)) {
        (value as Stream).on('error', this.onError)
      }
    }
  }

  /**
   * Return response headers.
   *
   * @return {object}
   * @api public
   */
  public get headers(): OutgoingHttpHeaders {
    return this.#rawResponse.getHeaders()
  }

  /**
   * Return response header.
   *
   * Examples:
   *
   *    response.get('Content-Type')
   *    // => "text/plain"
   *
   *    response.get('content-type')
   *    // => "text/plain"
   *
   * @param {string} field
   * @return {string}
   * @api public
   */
  public get(field: string): string {
    return this.#rawResponse.getHeader(field) as string
  }

  /**
   * Set header `field` to `value`, or pass an object of header fields.
   *
   * Examples:
   *
   *    response.set('Foo', ['bar', 'baz'])
   *    response.set('Accept', 'application/json')
   *    response.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' })
   *
   * @param {string|object} field
   * @param {string|string[]} value
   * @api public
   */
  public set(
    field: string | KeyValueObject<string | string[]>,
    value?: string | string[]
  ): void {
    if (arguments.length === 2) {
      this.#rawResponse.setHeader(field as string, value as string)
      return
    }

    for (const key in field as KeyValueObject<string | string[]>) {
      this.set(key, field[key])
    }
  }

  /**
   * Return a boolean indicating whether a header
   * with the specified field exists or not.
   *
   * Examples:
   *
   *    response.has('Accept')
   *    // => true
   *
   *    response.has('X-Accept')
   *    // => false
   *
   * @param {string} field
   * @param {boolean}
   * @api public
   */
  public has(field: string): boolean {
    return this.#rawResponse.hasHeader(field)
  }

  /**
   * Get the ETag of a response.
   *
   * @return {string}
   * @api public
   */
  public get etag(): string {
    return this.get('etag') as string
  }

  /**
   * Set the ETag of a response.
   * This will normalize the quotes if necessary.
   *
   *    response.etag = 'md5hashsum'
   *    response.etag = '"md5hashsum"'
   *    response.etag = 'W/"123456789"'
   *
   * @param {string} etag
   * @api public
   */
  public set etag(value: string) {
    if (!/^(W\/)?"/.test(value)) value = `"${value}"`
    this.set('etag', value)
  }

  /**
   * Return parsed response Content-Length when present.
   *
   * @return {number}
   * @api public
   */
  public get length(): number {
    const len = this.get('content-length')
    /* istanbul ignore next */
    if (len) return ~~len as number
    return getLength(this.#BODY, this.flag) as number
  }

  /**
   * Set Content-Length field to `size`.
   *
   * @param {number} size
   * @api public
   */
  public set length(size: number) {
    this.set('content-length', String(size))
  }

  /**
   * Check if a header has been written to the socket.
   *
   * @return {boolean}
   * @api public
   */
  public get headerSent(): boolean {
    return this.#rawResponse.headersSent
  }

  /**
   * Vary on `field`.
   *
   * @param {string} field
   * @api public
   */
  public vary(field: string | string[]): void {
    vary(this.#rawResponse, field)
  }

  /**
   * Perform a 302 redirect to `url`.
   *
   * The string "back" is special-cased
   * to provide Referrer support, when Referrer
   * is not present `alt` or "/" is used.
   *
   * Examples:
   *
   *    this.redirect('/login')
   *    this.redirect('http://google.com')
   *
   * @param {string} url
   * @api public
   */
  public redirect(url: string): void {
    // location
    if (url === 'back') url = this.#request.get('referrer') || '/'
    this.set('location', url)

    // status
    if (!'300 301 302 303 305 307 308'.includes(`${this.status}`)) this.status = 302

    // html
    if (this.#request.accepts('html')) {
      url = encodeURIComponent(url)
      this.set('content-type', 'text/html; charset=utf-8')
      this.end(`Redirecting to <a href="${url}">${url}</a>.`)
      return
    }

    // text
    if (this.#request.accepts('text')) {
      url = encodeURIComponent(url)
      this.set('content-type', 'text/plain; charset=utf-8')
      this.end(`Redirecting to ${url}.`)
      return
    }

    return
  }

  /**
   * Set Content-Disposition header to "attachment" with optional `filename`.
   *
   * @param {string} filename
   * @api public
   */
  public attachment(filename?: string): void {
    if (filename) this.type = extname(filename)
    this.set('content-disposition', contentDisposition(filename))
  }

  /**
   * Get the Last-Modified date in Date form, if it exists.
   *
   * @return {Date}
   * @api public
   */
  public get lastModified(): string | Date {
    const date = this.get('last-modified')
    if (date) return new Date(date as string)
    return ''
  }

  /**
   * Set the Last-Modified date using a string or a Date.
   *
   *     response.lastModified = new Date()
   *     response.lastModified = '2013-09-13'
   *
   * @param {string|Date} type
   * @api public
   */
  public set lastModified(value: string | Date) {
    if (typeof value === 'string') value = new Date(value)
    this.set('last-modified', value.toUTCString())
  }

  /**
   * Return the response mime type void of
   * parameters such as "charset".
   *
   * @return {string}
   * @api public
   */
  public get type(): string {
    const type = this.get('content-type')
    if (!type) return ''
    return (type as string).split(';')[0]
  }

  /**
   * Set Content-Type response header with `type` through `mime.lookup()`
   * when it does not contain a charset.
   *
   * Examples:
   *
   *     response.type = '.html'
   *     response.type = 'html'
   *     response.type = 'json'
   *     response.type = 'application/json'
   *     response.type = 'png'
   *
   * @param {string} type
   * @api public
   */
  public set type(type: string) {
    type = getMimeType(type, this.config['getContentType'] as GetContentTypeHandler) as string

    if (type) {
      this.set('content-type', type)
      return
    }

    this.remove('content-type')
  }

  /**
   * Check whether the response is one of the listed types.
   * Pretty much the same as `this.#requestuest.is()`.
   *
   * @param {string|string[]} types...
   * @return {string|false}
   * @api public
   */
  public is(type?, ...types): string | false {
    return typeIs(this.type, type, ...types)
  }

  /**
   * Append additional header `field` with valueue `value`.
   *
   * Examples:
   *
   *    response.append('Link', ['<http://localhost/>', '<http://localhost:3000/>'])
   *    response.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly')
   *    response.append('Warning', '199 Miscellaneous warning')
   *
   * @param {string} field
   * @param {string|string[]} value
   * @api public
   */
  public append(field: string, value: string | string[]): void {
    const prev = this.get(field) as string

    if (prev) {
      value = Array.isArray(prev)
        ? /* istanbul ignore next */ prev.concat(value)
        : [prev].concat(value)
    }

    return this.set(field, value)
  }

  /**
   * Remove header `field`.
   *
   * @param {string} field
   * @api public
   */
  public remove(field: string): void {
    this.#rawResponse.removeHeader(field.toLowerCase())
  }

  /**
   * Checks if the request is writable.
   * Tests for the existence of the socket
   * as node sometimes does not set it.
   *
   * @return {boolean}
   * @api private
   */
  public get writable(): boolean {
    return writable(this.#rawResponse)
  }

  /**
   * Flush any set headers, and begin the body.
   *
   * @api public
   */
  public flush(): void {
    return this.#rawResponse.flushHeaders()
  }

  /**
   * End a response, likes `response.end(...)`.
   *
   * @return {boolean}
   * @api public
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public end(...args: any): void {
    this.#rawResponse.end(...args)
    return
  }

  /**
   * Send a response.
   *
   * Examples:
   *
   *     response.send(200, new Buffer('wahoo'))
   *     response.send(200, '<p>some html</p>')
   *     response.send(200, { some: 'json' })
   *     response.send(200, stream)
   *
   * @param {number} code
   * @param {string|number|Buffer|object|stream|null|undefined} body
   * @api public
   */
  public send(code: number, body: BodyContent): ServerResponse | void {
    /* istanbul ignore next */
    if (getFlag(body) !== FLAGS.Stream) {
      this.#rawResponse['responded'] = true
      this.#rawResponse.statusCode = code
    }

    return respondHook(this.#rawResponse, body)
  }

  /**
   * Return the cookies instance.
   *
   * @return {Cookies}
   * @api public
   */
  public get cookies(): Cookies {
    return this.#cookies
  }

  /**
   * Set response status code.
   * 
   * @param   {number} code 
   * @return  {ServerResponse}
   */
  public statusCode(code) {
    this.status = code
    return this
  }

  /**
   * Set response status code.
   * 
   * @param   {number} code 
   * @return  {ServerResponse}
   */
  public code(code) {
    this.status = code
    return this
  }

  /**
   * Send a JSON response.
   * 
   *     response.json(null);
   *     response.json({ user: 'imed' });
   * @param   {object} payload
   * @return  {Kernel}
   */
  public json(payload: KeyValueObject | null) {
    return this.send(
      ...(
        payload && getFlag(payload) !== FLAGS.Object ? [400, new HttpError(400).message]
          : [this.status, payload]
      ) as [number, unknown]
    )
  }

  /**
   * Send given HTTP status code.
   *
   * Sets the response status to `statusCode` and the body of the
   * response to the standard description from node's http.STATUS_CODES
   * or the statusCode number if no description.
   *
   * Examples:
   *
   *     response.sendStatus(200);
   *
   * @param {number} statusCode
   * @public
   */
  public sendStatus(statusCode: number) {
    const body = statuses[statusCode] || String(statusCode)
    this.type = 'txt'

    return this.send(statusCode, body);
  }

  /**
   * Render `view` with given `targetViewName` and passed `options`.
   * 
   * @public
   */
  public async render<T = unknown>(targetViewName: string, params?: KeyValueObject<T>) {
    let content, status

    try {
      content = await this.#viewEngineInstance.generateHtml(targetViewName, params || {})
      this.type = 'html'
      status = this.status
    } catch (error) {
      const internalError = new HttpError(500)
      content = `${internalError.message} - ${error}`
      status = +internalError.status
    }

    return this.send(status, content)
  }

  /**
   * Send file content through `locatedFilePath`.
   * 
   * @public
   */
  public async sendFile(locatedFilePath: PathLike): Promise<void> {
    // verify that the locatedFilePath exist 
    if (!existsSync(locatedFilePath)) {
      this.send(404, `File ${new HttpError(404).message}`)
      return
    }

    // avoid to use sync behave here because big files can broke the event loop).
    const stats = await stat(locatedFilePath)

    // update headers for the response
    this.status = /* this.#request.fresh ? 304 : */ 200
    this.lastModified = stats.mtime
    this.length = stats.size
    this.type = extname(locatedFilePath as string)

    // create the readable stream then pipe it to the raw response
    const readableFileStream = createReadStream(locatedFilePath).pipe(this.raw)

    // streamEndListener for the readableFileStream
    const streamEndListener = new Promise((resolve, reject) => {
      readableFileStream
        .on('end', resolve)
        .on('finish', resolve)
        .on('error', reject);
    })

    await streamEndListener
  }

  /**
   * Inspect implementation.
   *
   * @return {object}
   * @api public
   */
  public inspect(): toJSON {
    const object = this.toJSON()
    object.body = this.body

    return object
  }

  /**
   * Return JSON representation.
   *
   * @return {object}
   * @api public
   */
  public toJSON(): toJSON {
    return {
      status: this.status,
      message: this.message,
      headers: this.headers
    }
  }
}

export default Response
