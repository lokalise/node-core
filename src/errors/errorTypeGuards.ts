import { isPublicNonRecoverableError } from '../errors/PublicNonRecoverableError'

import type { EntityGoneError } from './publicErrors'

/**
 * @deprecated Use `error instanceof EntityGoneError` instead. For errors created with `@lokalise/errors`, use `isInstance()` on your own gone error class built with `PublicError.from()`.
 */
export function isEntityGoneError(entity: unknown): entity is EntityGoneError {
  return isPublicNonRecoverableError(entity) && entity.httpStatusCode === 410
}
