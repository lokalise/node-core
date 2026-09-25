import { isPublicNonRecoverableError } from '../errors/PublicNonRecoverableError'

import type { EntityGoneError } from './publicErrors'

/**
 * @deprecated Use `error instanceof EntityGoneError` instead. For errors created with `@lokalise/errors`, use `PublicError.isInstance()` and compare the error `code`.
 */
export function isEntityGoneError(entity: unknown): entity is EntityGoneError {
  return isPublicNonRecoverableError(entity) && entity.httpStatusCode === 410
}
