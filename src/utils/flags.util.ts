import Stream from 'stream'

import type { BodyContent } from '../types'

// body type flags
export enum FLAGS {
  String,
  Object,
  Buffer,
  Stream
}

/**
 * determine the right flag for the current body.
 * 
 * @param {BodyContent} body 
 * @return {number}
 */
export function getFlag(body: BodyContent): number {
  if (!body || typeof body === 'string') return FLAGS.String
  if (Buffer.isBuffer(body)) return FLAGS.Buffer
  if (body instanceof Stream) return FLAGS.Stream
  return FLAGS.Object
}
