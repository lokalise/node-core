import { isPublicNonRecoverableError } from '../utils/typeUtils'

import type { EntityGoneError } from './publicErrors'

export function isEntityGoneError(entity: unknown): entity is EntityGoneError {
  return isPublicNonRecoverableError(entity) && entity.httpStatusCode === 410
}
