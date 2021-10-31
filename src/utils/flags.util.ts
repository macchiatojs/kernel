import Stream from 'stream'

import type { BodyContent } from '../types'

// body type flags
export const FLAG_STRING = 0
export const FLAG_OBJECT = 1
export const FLAG_BUFFER = 2
export const FLAG_STREAM = 4

/**
 * determine the right flag for the current body.
 * 
 * @param {BodyContent} body 
 * @return {number}
 */
export function getFlag(body: BodyContent): number {
  if (!body || typeof body === 'string') return FLAG_STRING
  if (Buffer.isBuffer(body)) return FLAG_BUFFER
  if (body instanceof Stream) return FLAG_STREAM
  return FLAG_OBJECT
}
