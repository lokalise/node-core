import type { TransactionObservabilityManager } from './observabilityTypes'

/**
 * A no-operation implementation of TransactionObservabilityManager.
 * All methods are implemented but do nothing.
 *
 * Use this implementation when you need to satisfy a TransactionObservabilityManager
 * dependency but don't want any actual observability tracking to occur.
 *
 * @example
 * ```typescript
 * const noopManager = new NoopObservabilityManager()
 * // Pass to any component requiring a TransactionObservabilityManager
 * const service = new MyService({ observabilityManager: noopManager })
 * ```
 */
export class NoopObservabilityManager implements TransactionObservabilityManager {
  /**
   * No-op implementation of start. Does nothing.
   * @param _transactionName - Ignored
   * @param _uniqueTransactionKey - Ignored
   */
  start(_transactionName: string, _uniqueTransactionKey: string): void {
    // noop
  }

  /**
   * No-op implementation of startWithGroup. Does nothing.
   * @param _transactionName - Ignored
   * @param _uniqueTransactionKey - Ignored
   * @param _transactionGroup - Ignored
   */
  startWithGroup(
    _transactionName: string,
    _uniqueTransactionKey: string,
    _transactionGroup: string,
  ): void {
    // noop
  }

  /**
   * No-op implementation of stop. Does nothing.
   * @param _uniqueTransactionKey - Ignored
   * @param _wasSuccessful - Ignored
   */
  stop(_uniqueTransactionKey: string, _wasSuccessful?: boolean): void {
    // noop
  }

  /**
   * No-op implementation of addCustomAttributes. Does nothing.
   * @param _uniqueTransactionKey - Ignored
   * @param _atts - Ignored
   */
  addCustomAttributes(
    _uniqueTransactionKey: string,
    _atts: { [key: string]: string | number | boolean },
  ): void {
    // noop
  }
}
