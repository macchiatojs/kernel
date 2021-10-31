import type { ServerResponse } from 'http'
import type { EventEmitter } from 'events'
// fork on-finished v2 - https://github.com/jshttp/on-finished -
import first from 'ee-first'

/**
 * Invoke callback when the response has finished [afterwards].
 * 
 * @param {ServerResponse} response 
 * @param {Function} listener 
 * @return {ServerResponse}
 */
export function onFinishedAfterware(
  response: ServerResponse,
  listener: first.Listener<EventEmitter>
): ServerResponse {
  // // Determine is response is already finished.
  // const isFinished =
  //   response.finished || response.writableEnded || !response?.socket?.writable
  // if (isFinished) {
  //   setImmediate(listener as any)
  //   return response
  // }

  first(
    [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [response.socket as any, 'error', 'close'],
      [response, 'end', 'finish'],
    ],
    listener
  )

  return response
}
