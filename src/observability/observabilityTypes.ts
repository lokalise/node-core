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

  /**
   * Runs the given function with the identified transaction set as the active one, so that work
   * performed inside it (spans, queries, outgoing calls) is recorded as part of the transaction
   * instead of as detached top-level work.
   *
   * Optional, because `start` and `stop` are two separate calls and cannot express a scope:
   * implementations able to propagate context opt in by providing this method. Callers must treat
   * its absence as "no context propagation available" and just invoke the function - use
   * `runInTransactionContext` instead of calling this directly.
   *
   * The name refers to the span of the underlying tracer, which is what implementations activate.
   *
   * @param uniqueTransactionKey - used for identifying the ongoing transaction to make active
   * @param fn - executed within the transaction context, its return value is passed through
   */
  runInSpanContext?: <T>(uniqueTransactionKey: string, fn: () => T) => T
}
