import hashlruCache  from 'hashlru'

import { getType } from './mime-types'
import { GetContentTypeHandler } from '../types'

/**
 * cache use to improve the mime type fetch process.
 */
const typeHashlruCache = hashlruCache(100)

/**
 * better performance than getType through the cache.
 * 
 * @param {string} type 
 * @return {string}
 */
export function getMimeType(type: string, handler?: GetContentTypeHandler): string|boolean {
  // use the local behave tiny but handle all most requirment.
  if (!handler) return getType(type)

  // use to handle behave like mime-types.
  let mimeType: string = typeHashlruCache.get(type)

  // should implement all .type in the test with both internal and external behave
  // and don't worry if it's work with internal 1000% work with external 'mime-type'. 
  /* istanbul ignore next */
  if (!mimeType) {
    mimeType = handler(type) as string
    typeHashlruCache.set(type, mimeType)
  }

  return mimeType
}
