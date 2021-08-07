import { IncomingMessage, ServerResponse } from 'http'
import Kernel from './kernel'
import Request from './request'
import Response from './response'

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
    // make request and this.response.
    this.request = new Request(this.rawRequest)
    this.response = new Response(this.rawResponse)

    // initialize the request and the this.response.
    this.request.initialize(app, config, this.response)
    this.response.initialize(app, config, this.request)
  }
}

export default Context
