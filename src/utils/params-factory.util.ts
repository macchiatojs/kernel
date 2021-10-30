import type Context from '../context'

/**
 * pick the correct params as array (then you can spread it).
 * 
 * @param {boolean} expressify 
 * @param {Context} context 
 * @return {(Request | Response)[]|Context[]}
 */
export function paramsFactory (expressify: boolean, context: Context): (Request | Response)[]|Context[] {
  const params = expressify 
    ? [context.request, context.response]
    : [context]

  return params as (Request | Response)[]|Context[]
}
