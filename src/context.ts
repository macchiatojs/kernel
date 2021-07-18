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
  app: Kernel
  config: Map<string, unknown>
  rawRequest: IncomingMessage
  rawResponse: ServerResponse
  request: Request
  response: Response

  constructor(
    app: Kernel,
    config: Map<string, unknown>,
    request: IncomingMessage,
    response: ServerResponse
  ) {
    // add the app instance.
    this.app = app
    // add the config Map.
    this.config = config

    // add raw request and raw response to context.
    this.rawRequest = request
    this.rawResponse = response

    // make request and response.
    this.request = new Request(request)
    this.response = new Response(response)

    // initialize the request and the response.
    this.request.initialize(app, config, this.response)
    this.response.initialize(app, config, this.request)
  }
}

export default Context
