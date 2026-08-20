import type { TransactionObservabilityManager } from './observabilityTypes'

/**
 * Runs the given function within the observability context of an already started transaction, so
 * that work performed inside it (spans, queries, outgoing calls) is recorded as part of that
 * transaction instead of as detached top-level work.
 *
 * Falls back to plain execution when no manager is given, or when the manager cannot propagate
 * context, so instrumented code never fails because of its observability tooling.
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
