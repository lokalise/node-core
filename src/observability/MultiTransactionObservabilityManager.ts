import type { TransactionObservabilityManager } from './observabilityTypes'
import { runInTransactionContext } from './runInTransactionContext'

/**
 * Groups different TransactionObservabilityManager instances into one
 * to facilitate tracking transactions across multiple observability tools.
 */
export class MultiTransactionObservabilityManager implements TransactionObservabilityManager {
  private readonly managers: TransactionObservabilityManager[]

  /**
   * Nests the contexts of every manager able to propagate one, so that the function runs within
   * all of them. Managers without context propagation are skipped.
   *
   * Only assigned when at least one wrapped manager can propagate context, so that its presence
   * keeps meaning what the interface says it means: a consumer checking for it to find out whether
   * its traces will be connected gets an answer about the wrapped managers instead of about this
   * wrapper. Call it through `runInTransactionContext`, which handles its absence.
   */
  readonly runInSpanContext?: <T>(uniqueTransactionKey: string, fn: () => T) => T

  constructor(managers: TransactionObservabilityManager[]) {
    this.managers = managers

    if (managers.some((manager) => manager.runInSpanContext)) {
      this.runInSpanContext = <T>(uniqueTransactionKey: string, fn: () => T): T =>
        managers.reduceRight<() => T>(
          (next, manager) => () => runInTransactionContext(manager, uniqueTransactionKey, next),
          fn,
        )()
    }
  }

  start(transactionName: string, uniqueTransactionKey: string): void {
    for (const manager of this.managers) {
      manager.start(transactionName, uniqueTransactionKey)
    }
  }

  startWithGroup(
    transactionName: string,
    uniqueTransactionKey: string,
    transactionGroup: string,
  ): void {
    for (const manager of this.managers) {
      manager.startWithGroup(transactionName, uniqueTransactionKey, transactionGroup)
    }
  }

  stop(uniqueTransactionKey: string, wasSuccessful?: boolean): void {
    for (const manager of this.managers) {
      manager.stop(uniqueTransactionKey, wasSuccessful)
    }
  }

  addCustomAttributes(
    uniqueTransactionKey: string,
    atts: { [p: string]: string | number | boolean },
  ): void {
    for (const manager of this.managers) {
      manager.addCustomAttributes(uniqueTransactionKey, atts)
    }
  }
}
