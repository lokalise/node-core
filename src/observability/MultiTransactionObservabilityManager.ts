import type { TransactionObservabilityManager } from './observabilityTypes'

/**
 * Groups different TransactionObservabilityManager instances into one
 * to facilitate tracking transactions across multiple observability tools.
 */
export class MultiTransactionObservabilityManager implements TransactionObservabilityManager {
  private readonly managers: TransactionObservabilityManager[]

  constructor(managers: TransactionObservabilityManager[]) {
    this.managers = managers
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

  addCustomAttributes(uniqueTransactionKey: string, atts: { [p: string]: string | number | boolean }): void {
    for (const manager of this.managers) {
      manager.addCustomAttributes(uniqueTransactionKey, atts)
    }
  }


}
