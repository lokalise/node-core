// Error structure commonly used in libraries, e. g. fastify
/**
 * @deprecated Use `StandardizedError` from `@lokalise/universal-ts-utils/node` instead.
 */
export type StandardizedError = {
  code: string
  message: string
}

/**
 * @deprecated Use `hasMessage` from `@lokalise/universal-ts-utils/node` instead.
 */
export function hasMessage(maybe: unknown): maybe is { message: string } {
  return isObject(maybe) && typeof maybe.message === 'string'
}

/**
 * @deprecated Use `isObject` from `@lokalise/universal-ts-utils/node` instead.
 */
export function isObject(maybeObject: unknown): maybeObject is Record<PropertyKey, unknown> {
  return typeof maybeObject === 'object' && maybeObject !== null
}

/**
 * @deprecated Use `isStandardizedError` from `@lokalise/universal-ts-utils/node` instead.
 */
export function isStandardizedError(error: unknown): error is StandardizedError {
  return isObject(error) && typeof error.code === 'string' && typeof error.message === 'string'
}

/**
 * @deprecated Use `isError` from `@lokalise/universal-ts-utils/node` instead.
 */
export function isError(maybeError: unknown): maybeError is Error {
  return (
    maybeError instanceof Error || Object.prototype.toString.call(maybeError) === '[object Error]'
  )
}
