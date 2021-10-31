/**
 * TODO: support only 2 types ['application/json', 'text/plain']
 *  and make some behave to handle the other types like fastify
 *  here: https://www.fastify.io/docs/latest/ContentTypeParser/
 *  to mnimize the bundle of macchiato.
 *  PS: 'mime-db' take more than 65% as you can see 
 *  here: https://bundlephobia.com/package/@macchiatojs/kernel
 */

import { contentType as getType } from 'mime-types'
import hashlruCache  from 'hashlru'

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
export function getMimeType(type: string): string {
  let mimeType: string = typeHashlruCache.get(type)

  if (!mimeType) {
    mimeType = getType(type) as string
    typeHashlruCache.set(type, mimeType)
  }

  return mimeType
}
