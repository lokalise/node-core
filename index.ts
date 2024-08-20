export type { ErrorDetails } from './src/errors/types'

export {
  PublicNonRecoverableError,
  type PublicNonRecoverableErrorParams,
} from './src/errors/PublicNonRecoverableError'

export {
  InternalError,
  type InternalErrorParams,
} from './src/errors/InternalError'
export { isEntityGoneError } from './src/errors/errorTypeGuards'

export { ConfigScope } from './src/config/ConfigScope'
export { ensureClosingSlashTransformer } from './src/config/configTransformers'
export { createRangeValidator } from './src/config/configValidators'
export {
  type EnvValueValidator,
  type EnvValueTransformer,
  type AppConfig,
  type RedisConfig,
} from './src/config/configTypes'

export {
  type Either,
  type DefiniteEither,
  success,
  failure,
  isSuccess,
  isFailure,
} from './src/errors/either'

export { EncryptionUtility } from './src/utils/encryptionUtility'

export { chunk, callChunked, removeFalsy, removeNullish } from './src/utils/arrayUtils'
export {
  groupBy,
  groupByPath,
  groupByUnique,
  pick,
  pickWithoutUndefined,
  copyWithoutUndefined,
  copyWithoutEmpty,
  isEmptyObject,
  convertDateFieldsToIsoString,
  deepClone,
} from './src/utils/objectUtils'

export {
  isError,
  isInternalError,
  isStandardizedError,
  isObject,
  isPublicNonRecoverableError,
  hasMessage,
} from './src/utils/typeUtils'
export { type StandardizedError } from './src/utils/typeUtils'

export { generateHash, HashAlgorithm, HashEncoding } from './src/utils/hashUtils'

export {
  resolveLoggerConfiguration,
  resolveMonorepoLoggerConfiguration,
} from './src/logging/loggerConfigResolver'
export type { AppLoggerConfig, MonorepoAppLoggerConfig } from './src/logging/loggerConfigResolver'
export type { CommonLogger } from './src/logging/commonLogger'

export {
  type ErrorReport,
  type ErrorReporter,
  type ErrorResolver,
} from './src/errors/errorReporterTypes'
export {
  executeAsyncAndHandleGlobalErrors,
  executeAndHandleGlobalErrors,
  executeSettleAllAndHandleGlobalErrors,
  globalLogger,
  resolveGlobalErrorLogObject,
} from './src/errors/globalErrorHandler'

export { type MayOmit } from './src/common/may-omit'
export { type FreeformRecord } from './src/common/commonTypes'
export {
  type ValidationError,
  type CommonErrorParams,
  type OptionalMessageErrorParams,
  RequestValidationError,
  AccessDeniedError,
  EntityNotFoundError,
  EntityGoneError,
  AuthFailedError,
} from './src/errors/publicErrors'

export { waitAndRetry } from './src/utils/waitUtils'

export type { TransactionObservabilityManager } from './src/observability/observabilityTypes'

export {
  generateChecksumForReadable,
  generateChecksumForObject,
  generateChecksumForBufferOrString,
} from './src/utils/checksumUtils'
export { FsReadableProvider } from './src/utils/streamUtils'
export type {
  PersistToFsOptions,
  ReadableProvider,
  FsReadableProviderOptions,
} from './src/utils/streamUtils'
