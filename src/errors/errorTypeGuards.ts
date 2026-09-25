import { isPublicNonRecoverableError } from '../errors/PublicNonRecoverableError'

import type { EntityGoneError } from './publicErrors'

/**
 * @deprecated Use `PublicError.isInstance()` from `@lokalise/errors` and compare the error `code` instead.
 */
export function isEntityGoneError(entity: unknown): entity is EntityGoneError {
  return isPublicNonRecoverableError(entity) && entity.httpStatusCode === 410
}
