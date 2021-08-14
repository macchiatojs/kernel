import type { IncomingMessage as httpIncomingMessage } from 'http'
import { format as stringify, URL } from 'url'
import type { Url } from 'url'
import { parse as parseType } from 'content-type'
import qs from 'querystring'
import type { ParsedUrlQuery } from 'querystring'
import accepts from 'accepts'
import type { Accepts } from 'accepts'
import parseRange from 'range-parser'
import type { TLSSocket } from 'tls'
import parseUrl from 'parseurl'
import typeIs from 'type-is'
import { isIP } from 'net'
import fresh from 'fresh'

import type Response from './response'
import type Kernel from './kernel'
import { METHODS } from './utils'

/**
 * Request
 *
 * @class Request
 * @param {IncomingMessage} request
 * @api public
 */
class Request {
  #app!: Kernel
  #response?: Response
  #accept: Accepts
  #memoizedURL?: URL
  #ip?: string
  config!: Map<string, unknown>
  #QUERY!: { [key:string]: string }

  /**
   * 
   * @param request 
   */
  constructor(public rawRequest: httpIncomingMessage) {
    this.#accept = accepts(rawRequest)
  }

  /**
   * Initialize.
   *
   * @param {Object} config
   * @param {Response} response
   * @api private
   */
  initialize(app: Kernel, config: Map<string, unknown>, response: Response) {
    this.#app = app
    this.config = config
    this.#response = response
    this.#ip = this.ips[0] || this.rawRequest.socket.remoteAddress || ''
  }

  /**
   * Return the request socket.
   *
   * @return {Connection}
   * @api public
   */
  public get socket() {
    return this.rawRequest.socket as TLSSocket
  }

  // /**
  //  * Return the raw request.
  //  *
  //  * @return {httpIncomingMessage}
  //  * @api public
  //  */
  // public get raw() {
  //   return this.rawRequest
  // }

  /**
   * Get request original url.
   *
   * @return {String} url
   * @api public
   */
  public get originalUrl(): string|undefined {
    return this.rawRequest.url?.split('?')[0]
  }

  /**
   * Get request method.
   *
   * @return {String}
   * @api public
   */
  public get method() {
    return this.rawRequest.method
  }

  /**
   * Set request method.
   *
   * @param {String} value
   * @api public
   */
  set method(value) {
    this.rawRequest.method = value
  }

  /**
   * Get request url.
   *
   * @return {String}
   * @api public
   */
  public get url() {
    return this.rawRequest.url
  }

  /**
   * Set request url.
   *
   * @param {String} val
   * @api public
   */
  set url(val) {
    this.rawRequest.url = val
  }

  /**
   * Return request headers.
   *
   * @return {Object}
   * @api public
   */
  public get headers() {
    return this.rawRequest.headers
  }

  /**
   * Return request header.
   *
   * The `Referrer` header field is special-cased,
   * both `Referrer` and `Referer` are interchangeable.
   *
   * Examples:
   *
   *     this.get('Content-Type');
   *     // => "text/plain"
   *
   *     this.get('content-type');
   *     // => "text/plain"
   *
   *     this.get('Something');
   *     // => undefined
   *
   * @param {String} field
   * @return {String}
   * @api public
   */
  public get(field: string): string {
    field = field.toLowerCase()
    if (field === 'referer' || field === 'referrer') {
      return (this.headers.referrer || this.headers.referer || '') as string
    }
    return (this.headers[field] || '') as string
  }

  /**
   * Check if the given `type(s)` is acceptable, returning
   * the best match when true, otherwise `false`, in which
   * case you should respond with 406 "Not Acceptable".
   *
   * The `type` value may be a single mime type string
   * such as "application/json", the extension name
   * such as "json" or an array `["json", "html", "text/plain"]`. When a list
   * or array is given the _best_ match, if any is returned.
   *
   * Examples:
   *
   *     // Accept: text/html
   *     this.accepts('html');
   *     // => "html"
   *
   *     // Accept: text/*, application/json
   *     this.accepts('html');
   *     // => "html"
   *     this.accepts('text/html');
   *     // => "text/html"
   *     this.accepts('json', 'text');
   *     // => "json"
   *     this.accepts('application/json');
   *     // => "application/json"
   *
   *     // Accept: text/*, application/json
   *     this.accepts('image/png');
   *     this.accepts('png');
   *     // => false
   *
   *     // Accept: text/*;q=.5, application/json
   *     this.accepts(['html', 'json']);
   *     this.accepts('html', 'json');
   *     // => "json"
   *
   * @param {String|Array} type(s)...
   * @return {String|Array|false}
   * @api public
   */
  accepts(...args) {
    return this.#accept.types(...args)
  }

  /**
   * Return accepted encodings or best fit based on `encodings`.
   *
   * Given `Accept-Encoding: gzip, deflate`
   * an array sorted by quality is returned:
   *
   *     ['gzip', 'deflate']
   *
   * @param {String|Array} encoding(s)...
   * @return {String|Array}
   * @api public
   */
  acceptsEncodings(...args) {
    return this.#accept.encodings(...args)
  }

  /**
   * Return accepted charsets or best fit based on `charsets`.
   *
   * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
   * an array sorted by quality is returned:
   *
   *     ['utf-8', 'utf-7', 'iso-8859-1']
   *
   * @param {String|Array} charset(s)...
   * @return {String|Array}
   * @api public
   */
  acceptsCharsets(...args) {    
    return this.#accept.charsets(...args)
  }

  /**
   * Return accepted languages or best fit based on `langs`.
   *
   * Given `Accept-Language: en;q=0.8, es, pt`
   * an array sorted by quality is returned:
   *
   *     ['es', 'pt', 'en']
   *
   * @param {String|Array} lang(s)...
   * @return {Array|String}
   * @api public
   */
  acceptsLanguages(...args) {
    return this.#accept.languages(...args)
  }

  /**
   * Check if the incoming request contains the "Content-Type"
   * header field, and it contains any of the give mime `type`s.
   * If there is no request body, `null` is returned.
   * If there is no content type, `false` is returned.
   * Otherwise, it returns the first `type` that matches.
   *
   * Examples:
   *
   *     // With Content-Type: text/html; charset=utf-8
   *     request.is('html') // => 'html'
   *     request.is('text/html') // => 'text/html'
   *     request.is('text/*', 'application/json') // => 'text/html'
   *
   *     // When Content-Type is application/json
   *     request.is('json', 'urlencoded') // => 'json'
   *     request.is('application/json') // => 'application/json'
   *     request.is('html', 'application/*') // => 'application/json'
   *
   *     request.is('html'); // => false
   *
   * @param {String|Array} types...
   * @return {String|false|null}
   * @api public
   */
  is(type, ...types) {    
    return typeIs(this.rawRequest, type, ...types)
  }

  /**
   * Return the request mime type void of
   * parameters such as "charset".
   *
   * @return {String}
   * @api public
   */
  public get type() {
    const type = this.get('content-type')
    if (!type) return ''
    return type.split(';')[0]
  }

  /**
   * Get the charset when present or undefined.
   *
   * @return {String}
   * @api public
   */
  public get charset() {
    const type = this.get('content-type')
    if (!type) return ''
    try {
      return parseType(type).parameters.charset || ''
    } catch (err) {
      return ''
    }
  }

  /**
   * Check if the request is fresh, aka
   * Last-Modified and/or the ETag
   * still match.
   *
   * @return {Boolean}
   * @api public
   */
  public get fresh(): boolean {
    const method = this.rawRequest.method
    const status = this.#response!.status

    // GET or HEAD for weak freshness validation only
    if (method !== 'GET' && method !== 'HEAD') return false

    // 2xx or 304 as per rfc2616 14.26
    if ((status >= 200 && status < 300) || status === 304) {
      return fresh(this.rawRequest.headers, this.#response!.headers)
    }

    return false
  }

  /**
   * Check if the request is stale, aka
   * "Last-Modified" and / or the "ETag" for the
   * resource has changed.
   *
   * @return {Boolean}
   * @api public
   */
  public get stale() {
    return !this.fresh
  }

  /**
   * Parse the "Host" header field host
   * and support X-Forwarded-Host when a
   * proxy is enabled.
   *
   * @return {String} hostname:port
   * @api public
   */
  public get host() {
    let host = this.config?.get('trust proxy') && this.get('x-forwarded-host')
    host = host || this.get('Host')
    if (!host) return ''
    return (host as string).split(/\s*,\s*/)[0].split(':', 1)[0]
  }

  /**
   * Parse the "Host" header field hostname
   * and support X-Forwarded-Host when a
   * proxy is enabled.
   *
   * @return {String} hostname
   * @api public
   */
  public get hostname() {
    const host = this.host
    if (!host) return ''    
    // if ('[' === host[0]) return this.URL.hostname || ''; // IPv6
    if ('[' === host[0]) return this.#URL?.hostname || ''; // IPv6
    return host.split(':', 1)[0]
  }

  /**
   * Get WHATWG parsed URL.
   * Lazily memoized.
   *
   * @return {URL|Object}
   * @api public
   */
  get #URL() {
    /* istanbul ignore else */
    if (!this.#memoizedURL) {
      const originalUrl = this.originalUrl || ''; // avoid undefined in template string
      try {
        this.#memoizedURL = new URL(`${this.origin}${originalUrl}`);
      } catch (err) {
        this.#memoizedURL = Object.create(null);
      }
    }

    return this.#memoizedURL;
  }

  /**
   * Return subdomains as an array.
   *
   * Subdomains are the dot-separated parts of the host before the main domain
   * of the app. By default, the domain of the app is assumed to be the last two
   * parts of the host. This can be changed by setting `app.subdomainOffset`.
   *
   * For example, if the domain is "tobi.ferrets.example.com":
   * If `app.subdomainOffset` is not set, this.subdomains is
   * `["ferrets", "tobi"]`.
   * If `app.subdomainOffset` is 3, this.subdomains is `["tobi"]`.
   *
   * @return {Array}
   * @api public
   */
  public get subdomains() {
    const hostname = this.hostname
    if (!hostname) return []
    return (isIP(hostname) ? [hostname] : hostname.split('.').reverse()).slice(
      this.config?.get('subdomain offset') as number
    )
  }

  /**
   * Return the protocol string "http" or "https"
   * when requested with TLS. When the proxy setting
   * is enabled the "X-Forwarded-Proto" header
   * field will be trusted. If you're running behind
   * a reverse proxy that supplies https for you this
   * may be enabled.
   *
   * @return {String}
   * @api public
   */
  public get protocol() {
    if (this.socket.encrypted) return 'https'
    if (!this.config?.get('trust proxy')) return 'http'
    return (this.get('x-forwarded-proto') || 'http').split(/\s*,\s*/)[0]
  }

  /**
   * Short-hand for:
   *
   *    request.protocol == 'https'
   *
   * @return {Boolean}
   * @api public
   */
  public get secure() {
    return this.protocol === 'https'
  }

  /**
   * Get origin of URL.
   *
   * @return {String}
   * @api public
   */
  public get origin() {
    return `${this.protocol}://${this.host}`
  }

  /**
   * Get full request URL.
   *
   * @return {String}
   * @api public
   */
  public get href() {
    // Support: `GET http://example.com/foo`
    if (/^https?:\/\//i.test(this.originalUrl!)) return this.originalUrl
    return this.origin + this.originalUrl
  }

  /**
   * Check if the request is idempotent.
   *
   * @return {Boolean}
   * @api public
   */
  public get idempotent() {
    return METHODS.indexOf(this.method as string) !== -1
  }

  /**
   * When `app.proxy` is `true`, parse
   * the "X-Forwarded-For" ip address list.
   *
   * For example if the value were "client, proxy1, proxy2"
   * you would receive the array `["client", "proxy1", "proxy2"]`
   * where "proxy2" is the furthest down-stream.
   *
   * @return {Array}
   * @api public
   */
  public get ips() {
    const proxy = this.config?.get('trust proxy')
    const value = this.get('x-forwarded-for')
    return proxy && value ? value.split(/\s*,\s*/) : []
  }

  /**
   * Return request's remote address
   * When `app.proxy` is `true`, parse
   * the "X-Forwarded-For" ip address list and return the first one
   *
   * @return {String}
   * @api public
   */
  public get ip() {
    return this.#ip
  }
  
  // public set ip(_ip) {
  //   this.#ip = _ip
  // }

  /**
   * Parse Range header field, capping to the given `size`.
   *
   * Unspecified ranges such as "0-" require knowledge of your resource length. In
   * the case of a byte range this is of course the total number of bytes. If the
   * Range header field is not given `undefined` is returned, `-1` when unsatisfiable,
   * and `-2` when syntactically invalid.
   *
   * When ranges are returned, the array has a "type" property which is the type of
   * range that is required (most commonly, "bytes"). Each array element is an object
   * with a "start" and "end" property for the portion of the range.
   *
   * The "combine" option can be set to `true` and overlapping & adjacent ranges
   * will be combined into a single range.
   *
   * NOTE: remember that ranges are inclusive, so for example "Range: users=0-3"
   * should respond with 4 users when available, not 3.
   *
   * @param {number} size
   * @param {object} [options]
   * @param {boolean} [options.combine=false]
   * @return {number|array}
   * @public
   */
  range(size: number, options?: parseRange.Options) {
    const range = this.get('range')
    if (!range) return
    return parseRange(size, range, options)
  }

  /**
   * Get request pathname.
   *
   * @return {String}
   * @api public
   */
  public get path(): string {
    return parseUrl(this.rawRequest)?.pathname as string
  }

  /**
   * Set pathname, retaining the query-string when present.
   *
   * @param {String} path
   * @api public
   */
  public set path(path: string) {
    const url = parseUrl(this.rawRequest)
    if (url?.pathname === path) return

    url!.pathname = path
    url!.path = null
    this.url = stringify(url as Url as unknown as URL)
  }

  /**
   * Get parsed query-string.
   *
   * @return {Object}
   * @api public
   */
  public get query(): ParsedUrlQuery {
    const str = this.querystring as string
    const c: { [key: string]: unknown } = this.#QUERY || (this.#QUERY = {})
    const q = c[str] || (c[str] = qs.parse(str)) 
    return q as ParsedUrlQuery
  }

  /**
   * Set query-string as an object.
   *
   * @param {Object} object
   * @api public
   */
  public set query(object) {
    this.querystring = qs.stringify(object)
  }

  /**
   * Get query string.
   *
   * @return {String}
   * @api public
   */
  public get querystring() {
    return parseUrl(this.rawRequest)?.query || ''
  }

  /**
   * Set querystring.
   *
   * @param {String} str
   * @api public
   */
  public set querystring(str) {
    const url = parseUrl(this.rawRequest)
    if (url?.search === `?${str}`) return

    url!.search = str as string
    url!.path = null

    this.url = stringify(url as Url as unknown as URL)
  }

  /**
   * Get the search string. Same as the querystring
   * except it includes the leading ?.
   *
   * @return {String}
   * @api public
   */
  public get search() {
    if (!this.querystring) return ''
    return `?${this.querystring}`
  }

  /**
   * Set the search string. Same as
   * response.querystring= but included for ubiquity.
   *
   * @param {String} str
   * @api public
   */
  public set search(str) {
    this.querystring = str
  }

  /**
   * Return parsed Content-Length when present.
   *
   * @return {Number}
   * @api public
   */
  public get length() {
    const len = this.get('content-length')
    if (len === '') return
    return ~~len
  }

  /**
   * Check if the request was an _XMLHttpRequest_.
   *
   * @return {Boolean}
   * @public
   */
  public get xhr(){
    const value = this.get('X-Requested-With') || '';
    return value.toLowerCase() === 'xmlhttprequest';
  }

  /**
   * Inspect implementation.
   *
   * @return {Object}
   * @api public
   */
  inspect() {
    // if (!this.rawRequest) return
    return this.toJSON()
  }

  /**
   * Return JSON representation.
   *
   * @return {Object}
   * @api public
   */
  toJSON() {
    return {
      method: this.method,
      url: this.url,
      headers: this.headers
    }
  }
}

export default Request

// cookies
// signedCookies