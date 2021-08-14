import type Context from '../context'

// return the correct params as array (then you can spread it)
export function paramsFactory (expressify: boolean, context: Context) {
  const params = expressify 
    ? [context.request, context.response]
    : [context]

  return params
}
