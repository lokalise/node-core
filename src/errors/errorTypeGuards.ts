import type { ResponseStatusError } from './ResponseStatusError'

export function isResponseStatusError(entity: unknown): entity is ResponseStatusError {
  return 'isResponseStatusError' in (entity as ResponseStatusError)
}
