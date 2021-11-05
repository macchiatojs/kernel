import { extname } from 'path'

/**
 * tiny mime type database.
 */
const MimeDB = {
  gif: 'image/gif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  json: 'application/json',
  stream: 'application/octet-stream',
  buffer: 'application/octet-stream',
  css: 'text/css; charset=utf-8',
  html: 'text/html; charset=utf-8',
  txt: 'text/plain; charset=utf-8',
  js: 'application/javascript; charset=utf-8',
}

/**
 * unique list values of the exist mime types db.
 */
const MimeUniqueValueList = [...new Set(Object.keys(MimeDB).map(key => MimeDB[key]))]

/**
 * extract the content-type header given a mime type or extension.
 * it's a tiny alternative to mime-types >> `contentType` method.
 *
 * @param {string} str
 * @return {boolean|string}
 */

export function getType (str: string): string|boolean {  
  // if the given string exsit as key in the MimeDB (early return).
  if (str in MimeDB) return MimeDB[str]

  // if the string value have already exist value in the MimeDB.
  if (MimeUniqueValueList.includes(str)) return str

  // try to support other types not supported by the current behave
  // like 'application/vnd.amazon.ebook' for more types support
  // you can use 'mime-types' module.
  if (str.startsWith('application/')) return str

  // remove the '/' when is start char.
  /* istanbul ignore next */
  if (str.startsWith('/')) str = str.slice(1)

  // extract the extension name only when the string don't start with '.'.
  if (!str.startsWith('.')) str = extname(str)

  // if the given string exsit as key in the MimeDB (with extension handler).
  if (str.slice(1) in MimeDB) return MimeDB[str.slice(1)]

  // otherwise, ...
  return false
}
