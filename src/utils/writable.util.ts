import type { ServerResponse } from 'http';

//
export function writable(response: ServerResponse) {
  // can't write any more after response finished
  if (response['writableEnded'] || response['responded']) return false
  /* istanbul ignore next */
  return response.socket?.writable
}
