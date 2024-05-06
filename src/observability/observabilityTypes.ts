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
   */
  stop: (uniqueTransactionKey: string) => unknown
}
