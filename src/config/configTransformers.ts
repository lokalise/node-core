import { ensureClosingSlash } from '../utils/paramUtils'

import type { EnvValueTransformer } from './configTypes'

export const ensureClosingSlashTransformer: EnvValueTransformer<
  string | undefined | null,
  string
> = (value) => {
  return ensureClosingSlash(value)
}
