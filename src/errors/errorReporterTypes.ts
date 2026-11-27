import type { InternalError } from './InternalError'

/**
 * Generic interface for resolving specific kind of errors based on something that was thrown during execution
 *
 * @deprecated Will be removed without a replacement.
 */
export type ErrorResolver = {
  processError: (thrownError: unknown) => InternalError
}

/**
 * @deprecated Use `ErrorReport` from `@lokalise/observability` instead. It also takes `severity` and `unhandled`.
 */
export interface ErrorReport {
  error: Error
  context?: Record<string, unknown>
}

/**
 * @deprecated Use `ErrorReporter` from `@lokalise/observability` instead.
 */
export type ErrorReporter = {
  report: (errorReport: ErrorReport) => void
}
