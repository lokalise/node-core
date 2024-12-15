export type TransactionObservabilityManager = {
  /**
   * Creates and starts a background transaction to record work done
   *
   * @param transactionName - used for grouping similar transactions together
   * @param uniqueTransactionKey - used for identifying specific ongoing transaction. Must be reasonably unique to reduce possibility of collisions
   */
  start: (transactionName: string, uniqueTransactionKey: string) => unknown

  /**
   * Creates and starts a background transaction to record work done, and relates it to a specified group
   *
   * @param transactionName - used for grouping similar transactions together
   * @param uniqueTransactionKey - used for identifying specific ongoing transaction. Must be reasonably unique to reduce possibility of collisions   *
   * @param transactionGroup - group is used for grouping related transactions with different names
   */
  startWithGroup: (
    transactionName: string,
    uniqueTransactionKey: string,
    transactionGroup: string,
  ) => void

  /**
   * Ends the transaction
   * @param uniqueTransactionKey - used for identifying specific ongoing transaction. Must be reasonably unique to reduce possibility of collisions
   * @param wasSuccessful - indicates if the transaction was successful or not
   */
  stop: (uniqueTransactionKey: string, wasSuccessful?: boolean) => unknown

  /**
   * Adds all custom attributes in an object to the current transaction.
   */
  addCustomAttributes(
    uniqueTransactionKey: string,
    atts: { [key: string]: string | number | boolean },
  ): void
}
