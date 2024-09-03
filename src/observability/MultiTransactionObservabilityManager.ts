import type { TransactionObservabilityManager } from './observabilityTypes'

export class MultiTransactionObservabilityManager implements TransactionObservabilityManager {
  private readonly managers: TransactionObservabilityManager[]

  constructor(managers: TransactionObservabilityManager[]) {
    if (managers.length === 0) throw new Error('At least one manager must be provided')
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
}
