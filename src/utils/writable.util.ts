import type { ServerResponse } from 'http';

//
export function writable(response: ServerResponse) {
  // can't write any more after response finished
  if (response['writableEnded'] || response['responded']) return false
  return response.socket?.writable
}
