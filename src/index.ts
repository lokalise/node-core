export type { ErrorDetails } from './errors/types'

export {
  PublicNonRecoverableError,
  isPublicNonRecoverableError,
  type PublicNonRecoverableErrorParams,
} from './errors/PublicNonRecoverableError'

export {
  InternalError,
  isInternalError,
  type InternalErrorParams,
} from './errors/InternalError'
export { isEntityGoneError } from './errors/errorTypeGuards'

export { ConfigScope } from './config/ConfigScope'
export { ensureClosingSlashTransformer } from './config/configTransformers'
export { createRangeValidator } from './config/configValidators'
export type {
  EnvValueValidator,
  EnvValueTransformer,
  AppConfig,
  RedisConfig,
} from './config/configTypes'

export {
  type Either,
  type DefiniteEither,
  success,
  failure,
  isSuccess,
  isFailure,
} from './errors/either'

export { EncryptionUtility } from './utils/encryptionUtility'

export {
  chunk,
  callChunked,
  removeFalsy,
  removeNullish,
  removeDuplicates,
} from './utils/arrayUtils'
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
  transformToKebabCase,
} from './utils/objectUtils'

export {
  isError,
  isStandardizedError,
  isObject,
  hasMessage,
} from './utils/typeUtils'
export type { StandardizedError } from './utils/typeUtils'

export { generateHash, HashAlgorithm, HashEncoding } from './utils/hashUtils'

export {
  resolveLoggerConfiguration,
  resolveMonorepoLoggerConfiguration,
  resolveLogger,
  resolveMonorepoLogger,
} from './logging/loggerConfigResolver'
export type { AppLoggerConfig, MonorepoAppLoggerConfig } from './logging/loggerConfigResolver'
export type { CommonLogger } from './logging/commonLogger'

export type {
  ErrorReport,
  ErrorReporter,
  ErrorResolver,
} from './errors/errorReporterTypes'
export {
  executeAsyncAndHandleGlobalErrors,
  executeAndHandleGlobalErrors,
  executeSettleAllAndHandleGlobalErrors,
  globalLogger,
  resolveGlobalErrorLogObject,
} from './errors/globalErrorHandler'

export type { MayOmit } from './common/may-omit'
export type { FreeformRecord } from './common/commonTypes'
export type { AtLeastOne } from './common/atLeastOne'
export {
  type ValidationError,
  type CommonErrorParams,
  type OptionalMessageErrorParams,
  RequestValidationError,
  AccessDeniedError,
  EntityNotFoundError,
  EntityGoneError,
  AuthFailedError,
} from './errors/publicErrors'

export { waitAndRetry } from './utils/waitUtils'

export type { TransactionObservabilityManager } from './observability/observabilityTypes'
export { MultiTransactionObservabilityManager } from './observability/MultiTransactionObservabilityManager'

export {
  generateChecksumForReadable,
  generateChecksumForObject,
  generateChecksumForBufferOrString,
} from './utils/checksumUtils'
export { FsReadableProvider } from './utils/streamUtils'
export type {
  PersistToFsOptions,
  ReadableProvider,
  FsReadableProviderOptions,
} from './utils/streamUtils'
