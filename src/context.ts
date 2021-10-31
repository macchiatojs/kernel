import Cookies from 'cookies'
import type { Option as CookiesOption } from 'cookies'
import type { IncomingMessage, ServerResponse } from 'http'

import Request from './request'
import Response from './response'
import type Kernel from './kernel'

/**
 * Initializer
 *
 * @class Context
 * @param {Kernel} app
 * @param {Request} request
 * @param {Response} response
 * @api public
 */
class Context {
  cookies: Cookies
  request: Request
  response: Response

  constructor(
    // add the app instance.
    public app: Kernel,
    // add the config Map.
    public config: Map<string, unknown>,
    // add raw request and raw response to context.
    public rawRequest: IncomingMessage,
    public rawResponse: ServerResponse
  ) {
    // add cookies manager.
    this.cookies = new Cookies(this.rawRequest, this.rawResponse, this.config.get('cookie') as CookiesOption)

    // make request and this.response.
    this.request = new Request(this.rawRequest)
    this.response = new Response(this.rawResponse)

    // initialize the request and the this.response.
    this.request.initialize(app, config, this.response, this.cookies)
    this.response.initialize(app, config, this.request, this.cookies)
  }
}

export default Context
