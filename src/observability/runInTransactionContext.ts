import type { TransactionObservabilityManager } from './observabilityTypes'

/**
 * Runs the given function within the observability context of an already started transaction, so
 * that work performed inside it (spans, queries, outgoing calls) is recorded as part of that
 * transaction instead of as detached top-level work.
 *
 * Runs the function directly when no manager is given, or when the manager cannot propagate
 * context, so that a manager without context propagation costs the caller nothing.
 *
 * When the manager can propagate context, it is the one that invokes the function, and this helper
 * neither catches its errors nor runs the function itself afterwards: a manager that throws after
 * the function already ran would otherwise run it twice. Implementations are required to call the
 * function exactly once and let its errors through (see `runInSpanContext`), so a manager that
 * breaks that contract can skip the work or fail the caller.
 *
 * Prefer this over calling the optional `runInSpanContext` directly: an inline
 * `manager.runInSpanContext?.(key, fn) ?? fn()` executes `fn` twice whenever it legitimately
 * returns `undefined` or `null`.
 *
 * @param manager - the manager the transaction was started on
 * @param uniqueTransactionKey - the key the transaction was started with
 * @param fn - executed within the transaction context, its return value is passed through
 */
export const runInTransactionContext = <T>(
  manager: TransactionObservabilityManager | undefined,
  uniqueTransactionKey: string,
  fn: () => T,
): T => (manager?.runInSpanContext ? manager.runInSpanContext(uniqueTransactionKey, fn) : fn())
