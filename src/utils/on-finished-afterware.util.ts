// fork on-finished v2 - https://github.com/jshttp/on-finished -
import first from 'ee-first'
import type { ServerResponse } from 'http'

// Invoke callback when the response has finished [afterwards].
export function onFinishedAfterware(
  response: ServerResponse,
  listener: any
): ServerResponse {
  // Determine is response is already finished.
  // const isFinished =
  //   response.finished || response.writableEnded || !response?.socket?.writable
  // if (isFinished) {
  //   setImmediate(listener)
  //   return response
  // }

  first(
    [
      [response.socket, 'error', 'close'],
      [response, 'end', 'finish'],
    ],
    listener
  )

  return response
}
