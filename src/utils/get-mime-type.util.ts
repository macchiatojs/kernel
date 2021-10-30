// TODO: rebuild this module and make it ovverrided when we create a new app.
// behave like fastify - https://www.fastify.io/docs/latest/ContentTypeParser/
import { contentType as getType } from 'mime-types'
import hashlruCache  from 'hashlru'

// cache use to improve the mime type fetch process.
const typeHashlruCache = hashlruCache(100)

/**
 * better performance than getType.
 * 
 * @param {string} type 
 * @return {string}
 */
export function getMimeType(type:string): string {
  let mimeType: string = typeHashlruCache.get(type)

  if (!mimeType) {
    mimeType = getType(type) as string
    typeHashlruCache.set(type, mimeType)
  }

  return mimeType
}
