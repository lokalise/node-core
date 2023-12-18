export {
  sendPut,
  sendPutBinary,
  sendDelete,
  sendPatch,
  sendGet,
  sendPost,
  sendPostBinary,
  httpClient,
  buildClient,
  type RequestOptions,
  type Response,
  type HttpRequestContext,
  type ResponseSchema,
} from './src/http/httpClient'

export { PublicNonRecoverableError, type PublicNonRecoverableErrorParams } from './src/errors/PublicNonRecoverableError'

export { InternalError, type ErrorDetails, type InternalErrorParams } from './src/errors/InternalError'
export { ResponseStatusError } from './src/errors/ResponseStatusError'

export { ConfigScope } from './src/config/ConfigScope'
export { ensureClosingSlashTransformer } from './src/config/configTransformers'
export { createRangeValidator } from './src/config/configValidators'
export {
  type EnvValueValidator,
  type EnvValueTransformer,
  type AppConfig,
  type RedisConfig,
} from './src/config/configTypes'

export { type Either, success, failure, isSuccess, isFailure } from './src/errors/either'

export { chunk, callChunked, removeFalsy, removeNullish } from './src/utils/arrayUtils'
export {
  groupBy,
  groupByUnique,
  pick,
  pickWithoutUndefined,
  copyWithoutUndefined,
  isEmptyObject,
  convertDateFieldsToIsoString,
  deepClone,
} from './src/utils/objectUtils'

export {
  isInternalError,
  isStandardizedError,
  isObject,
  isPublicNonRecoverableError,
  hasMessage,
} from './src/utils/typeUtils'
export { type StandardizedError } from './src/utils/typeUtils'

export { resolveLoggerConfiguration } from './src/logging/loggerConfigResolver'
export { type AppLoggerConfig } from './src/logging/loggerConfigResolver'

export { type ErrorReport, type ErrorReporter, type ErrorResolver } from './src/errors/errorReporterTypes'
export {
  executeAsyncAndHandleGlobalErrors,
  executeAndHandleGlobalErrors,
  executeSettleAllAndHandleGlobalErrors,
  globalLogger,
  resolveGlobalErrorLogObject,
} from './src/errors/globalErrorHandler'

export { type MayOmit } from './src/common/may-omit'

export { waitAndRetry } from './src/utils/waitUtils'
