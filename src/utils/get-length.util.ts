import { BodyContent } from '../types'
import { FLAGS } from './flags.util'

/**
 * determine the length the current body.
 * 
 * @param {BodyContent} body 
 * @param {number} flag 
 * @return {number|void}
 */
export function getLength(body: BodyContent, flag = FLAGS.String): number|void {
  if (!body) return 0
  if (flag === FLAGS.String) return Buffer.byteLength(body as string)
  if (flag === FLAGS.Object) return Buffer.byteLength(JSON.stringify(body))
  if (flag === FLAGS.Buffer) return (body as Buffer).length
}
