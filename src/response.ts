import { TLSSocket } from 'tls';
import { STATUS_CODES as statuses, ServerResponse } from 'http'
import contentDisposition from 'content-disposition'
import HttpError from '@macchiatojs/http-error'
import { is as typeIs } from 'type-is'
import { extname } from 'path'
import assert from 'assert'
import vary from 'vary'

import { getFlag, getLength, getMimeType, send, writable, FLAG_STREAM } from './utils'
import Request from './request'
import Kernel from './kernel';

/**
 * Response
 *
 * @class Response
 * @param {ServerResponse} response
 * @api public
 */

class Response {
  #app!: Kernel
  #request!: Request
  #BODY: any
  config!: Map<string, unknown>
  rawResponse: ServerResponse
  flag!: number
  onError: (err: HttpError|Error) => void

  constructor(response: ServerResponse) {
    this.rawResponse = response
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.onError = () => {}
  }

  /**
   * Initialize.
   *
   * @param {Object} config
   * @param {Request} request
   * @api private
   */
  initialize(app: Kernel, config: Map<string, unknown>, request: Request) {
    this.#app = app
    this.config = config
    this.#request = request
  }
  
  /**
   * Return the request socket.
   *
   * @return {Connection}
   * @api public
   */
  public get socket() {
    return this.#request.socket as TLSSocket
  }

  /**
   * Return the raw response.
   *
   * @return {ServerResponse}
   * @api public
   */
  public get raw() {
    return this.rawResponse
  }

  /**
   * Get response status code.
   *
   * @return {Number}
   * @api public
   */
  public get status(): number {
    return this.rawResponse.statusCode
  }

  /**
   * Set response status code.
   *
   * @param {Number} code
   * @api public
   */
  public set status(code) {
    assert(typeof code === 'number', 'status code must be a number')
    const message = statuses[code]
    assert(message, `invalueid status code: ${code}`)
    assert(!this.rawResponse.headersSent, 'headers have already been sent')
    this.rawResponse.statusCode = code
    this.rawResponse.statusMessage = message
  }

  /**
   * Get response status message.
   *
   * @return {String}
   * @api public
   */
  public get message() {
    return this.rawResponse.statusMessage
    // ||  statuses[this.status]
  }

  /**
   * Set response status message.
   *
   * @param {String} msg
   * @api public
   */
  public set message(msg: string) {
    this.rawResponse.statusMessage = msg
  }

  /**
   * Get response body.
   *
   * @return {Mixed}
   * @api public
   */
  public get body() {
    return this.#BODY
  }

  /**
   * Set response body.
   *
   * @param {String|Buffer|Object|Stream} value
   * @api public
   */
  public set body(value) {
    this.#BODY = value

    if (this.rawResponse.headersSent) return

    // no content
    if (value === null) {
      if (!this.#app.emptyBodyStatues.has(this.status)) this.status = 204
      this.remove('Content-Type')
      this.remove('Content-Length')
      this.remove('Transfer-Encoding')
      return
    }

    this.flag = getFlag(value)

    // stream
    if (this.flag === FLAG_STREAM) {
      /* istanbul ignore next */
      if (!new Set(value.listeners('error')).has(this.onError)) {
        value.on('error', this.onError)
      }
    }
  }

  /**
   * Return response headers.
   *
   * @return {Object}
   * @api public
   */
  public get headers() {
    return this.rawResponse.getHeaders()
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
   * @param {String} field
   * @return {String}
   * @api public
   */
  public get(field) {
    return this.rawResponse.getHeader(field)
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
   * @param {String|Object|Array} field
   * @param {String} value
   * @api public
   */
  public set(
    field: string | { [key: string]: string | string[] },
    value?: string | string[]
  ) {
    if (arguments.length === 2) {
      this.rawResponse.setHeader(field as string, value as string)
      return
    }

    for (const key in field as { [key: string]: string | string[] }) {
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
   * @param {String} field
   * @param {Boolean}
   * @api public
   */
  has(field) {
    return this.rawResponse.hasHeader(field)
  }

  /**
   * Set the ETag of a response.
   * This will normalize the quotes if necessary.
   *
   *    response.etag = 'md5hashsum'
   *    response.etag = '"md5hashsum"'
   *    response.etag = 'W/"123456789"'
   *
   * @param {String} etag
   * @api public
   */
  public set etag(value: string) {
    if (!/^(W\/)?"/.test(value)) value = `"${value}"`
    this.set('etag', value)
  }

  /**
   * Get the ETag of a response.
   *
   * @return {String}
   * @api public
   */
  public get etag() {
    return this.get('etag') as string
  }

  /**
   * Return parsed response Content-Length when present.
   *
   * @return {Number}
   * @api public
   */
  public get length() {
    const len = this.get('content-length')
    /* istanbul ignore next */
    if (len) return ~~len as number
    return getLength(this.#BODY, this.flag)
  }

  /**
   * Set Content-Length field to `n`.
   *
   * @param {Number} n
   * @api public
   */
  public set length(n) {
    this.set('content-length', String(n))
  }

  /**
   * Check if a header has been written to the socket.
   *
   * @return {Boolean}
   * @api public
   */
  public get headerSent() {
    return this.rawResponse.headersSent
  }

  /**
   * Vary on `field`.
   *
   * @param {String} field
   * @api public
   */
  vary(field: string | string[]) {
    vary(this.rawResponse, field)
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
   *    this.redirect('back');
   *    this.redirect('back', '/index.html');
   *    this.redirect('/login');
   *    this.redirect('http://google.com');
   *
   * @param {String} url
   * @param {String} [alt]
   * @api public
   */
  redirect(url: string) {
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
   * @param {String} filename
   * @api public
   */
  attachment(filename?: string) {
    if (filename) this.type = extname(filename)
    this.set('content-disposition', contentDisposition(filename))
  }

  /**
   * Get the Last-Modified date in Date form, if it exists.
   *
   * @return {Date}
   * @api public
   */
  public get lastModified() {
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
   * @param {String|Date} type
   * @api public
   */
  public set lastModified(value: string | Date) {
    if (typeof value === 'string') value = new Date(value)
    this.set('last-modified', value.toUTCString())
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
   * @param {String} type
   * @api public
   */
  public set type(type: string) {
    type = getMimeType(type)

    if (type) {
      this.set('content-type', type)
    } else {
      this.remove('content-type')
    }
  }

  /**
   * Return the response mime type void of
   * parameters such as "charset".
   *
   * @return {String}
   * @api public
   */
  public get type() {
    const type = this.get('content-type')
    if (!type) return ''
    return (type as string).split(';')[0]
  }

  /**
   * Check whether the response is one of the listed types.
   * Pretty much the same as `this.#requestuest.is()`.
   *
   * @param {String|Array} types...
   * @return {String|false}
   * @api public
   */
  is(type?, ...types) {
    return typeIs(this.type, type, ...types);
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
   * @param {String} field
   * @param {String|Array} value
   * @api public
   */
  append(field: string, value: string | string[]) {
    const prev = this.get(field) as string

    if (prev) {
      value = Array.isArray(prev)
        /* istanbul ignore next */
        ? prev.concat(value)
        : [prev].concat(value)
    }

    return this.set(field, value)
  }

  /**
   * Remove header `field`.
   *
   * @param {String} field
   * @api public
   */
  remove(field: string) {
    this.rawResponse.removeHeader(field.toLowerCase())
  }

  /**
   * Checks if the request is writable.
   * Tests for the existence of the socket
   * as node sometimes does not set it.
   *
   * @return {Boolean}
   * @api private
   */

  get writable() {
    return writable(this.rawResponse)
  }

  /**
   * Flush any set headers, and begin the body.
   *
   * @api public
   */
  flush() {
    return this.rawResponse.flushHeaders()
  }

  /**
   * End a response, likes `response.end(...)`.
   *
   * @param {String|Buffer} data
   * @param {String} encoding
   * @param {Function} callback
   * @return {Boolean}
   * @api public
   */
  end(...args) {
    return this.rawResponse.end(...args)
  }

  /**
   * Send a response.
   *
   * Examples:
   *
   *     response.send(200, new Buffer('wahoo'));
   *     response.send(200, '<p>some html</p>');
   *     response.send(200, { some: 'json' });
   *     response.send(200, stream);
   *
   * @param {Number} code
   * @param {String|Buffer|Object|Stream} body
   * @return {Boolean}
   * @api public
   */
  send(code, body) {
    this.rawResponse['responded'] = true
    this.rawResponse.statusCode = code
    send(this.rawResponse, body, getFlag(body), this.onError)

    return
  }

  /**
   * Inspect implementation.
   *
   * @return {Object}
   * @api public
   */
  inspect() {
    const object: { [key: string]: any } = this.toJSON()
    object.body = this.body

    return object
  }

  /**
   * Return JSON representation.
   *
   * @return {Object}
   * @api public
   */
  toJSON() {
    return {
      status: this.status,
      message: this.message,
      headers: this.headers
    }
  }
}

export default Response
