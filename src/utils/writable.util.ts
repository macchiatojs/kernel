import type { ServerResponse } from 'http'

/**
 * checker for response is finished or not.
 * 
 * @param {ServerResponse} response 
 * @return {boolean}
 */
export function writable(response: ServerResponse): boolean {
  // can't write any more after response finished.
  if (response['writableEnded'] || response['responded']) return false
  /* istanbul ignore next */
  return !!response.socket?.writable
}
