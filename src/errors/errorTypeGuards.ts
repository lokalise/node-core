import { isError } from '../utils/typeUtils'

import type { ResponseStatusError } from './ResponseStatusError'
import type { EntityGoneError } from './publicErrors'

export function isResponseStatusError(entity: unknown): entity is ResponseStatusError {
  return 'isResponseStatusError' in (entity as ResponseStatusError)
}

export function isEntityGoneError(entity: unknown): entity is EntityGoneError {
  return isError(entity) && 'httpStatusCode' in entity && entity.httpStatusCode === 410
}
