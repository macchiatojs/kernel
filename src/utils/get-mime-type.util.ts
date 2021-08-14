import { contentType as getType } from 'mime-types'
import hashlruCache  from 'hashlru'

// cache use to improve the mime type fetch process.
const typeHashlruCache = hashlruCache(100)

// better performance than getType.
export function getMimeType(type:string): string {
  let mimeType: string = typeHashlruCache.get(type)

  if (!mimeType) {
    mimeType = getType(type) as string
    typeHashlruCache.set(type, mimeType)
  }

  return mimeType
}
