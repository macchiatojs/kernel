import { BodyContent } from '../types'
import { FLAG_STRING, FLAG_OBJECT, FLAG_BUFFER } from './flags.utils'

// determine the length the current body.
export function getLength(body: BodyContent, flag = FLAG_STRING): number|void {
  if (!body) return 0
  if (flag === FLAG_STRING) return Buffer.byteLength(body as string)
  if (flag === FLAG_OBJECT) return Buffer.byteLength(JSON.stringify(body))
  if (flag === FLAG_BUFFER) return (body as Buffer).length
}
