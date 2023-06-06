import type { InternalError } from './InternalError'

/**
 * Generic interface for resolving specific kind of errors based on something that was thrown during execution
 */
export type ErrorResolver = {
  processError: (thrownError: unknown) => InternalError
}

export interface ErrorReport {
  error: Error
  context?: Record<string, unknown>
}

export type ErrorReporter = {
  report: (errorReport: ErrorReport) => void
}
