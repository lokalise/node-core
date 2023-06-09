export {
  sendPut,
  sendPutBinary,
  sendDelete,
  sendPatch,
  sendGet,
  sendPost,
  httpClient,
  buildClient,
} from './src/http/httpClient'
export type {
  RequestOptions,
  Response,
  HttpRequestContext,
  ResponseSchema,
} from './src/http/httpClient'

export { PublicNonRecoverableError } from './src/errors/PublicNonRecoverableError'
export type { PublicNonRecoverableErrorParams } from './src/errors/PublicNonRecoverableError'

export { InternalError } from './src/errors/InternalError'
export { ResponseStatusError } from './src/errors/ResponseStatusError'
export type { ErrorDetails, InternalErrorParams } from './src/errors/InternalError'

export { ConfigScope } from './src/config/ConfigScope'
export { ensureClosingSlashTransformer } from './src/config/configTransformers'
export { createRangeValidator } from './src/config/configValidators'
export type {
  EnvValueValidator,
  EnvValueTransformer,
  AppConfig,
  RedisConfig,
} from './src/config/configTypes'

export type { Either } from './src/errors/either'

export { chunk, callChunked } from './src/utils/arrayUtils'
export {
  groupBy,
  pick,
  pickWithoutUndefined,
  copyWithoutUndefined,
  isEmptyObject,
} from './src/utils/objectUtils'

export {
  isInternalError,
  isStandardizedError,
  isObject,
  isPublicNonRecoverableError,
  hasMessage,
} from './src/utils/typeUtils'
export type { StandardizedError } from './src/utils/typeUtils'

export { resolveLoggerConfiguration } from './src/logging/loggerConfigResolver'
export type { AppLoggerConfig } from './src/logging/loggerConfigResolver'

export type { ErrorReport, ErrorReporter, ErrorResolver } from './src/errors/errorReporterTypes'
export {
  executeAsyncAndHandleGlobalErrors,
  executeAndHandleGlobalErrors,
  globalLogger,
  resolveGlobalErrorLogObject,
} from './src/errors/globalErrorHandler'
