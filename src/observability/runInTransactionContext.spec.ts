import type { TransactionObservabilityManager } from './observabilityTypes'
import { runInTransactionContext } from './runInTransactionContext'

describe('runInTransactionContext', () => {
  const buildManager = (): TransactionObservabilityManager => ({
    start: () => {},
    startWithGroup: () => {},
    stop: () => {},
    addCustomAttributes: () => {},
  })

  it('executes the function when there is no manager', () => {
    expect(runInTransactionContext(undefined, 'key', () => 'result')).toBe('result')
  })

  it('executes the function when the manager cannot propagate context', () => {
    expect(runInTransactionContext(buildManager(), 'key', () => 'result')).toBe('result')
  })

  it('delegates to the manager when it can propagate context', () => {
    const runInSpanContext = vi.fn((_key: string, fn: () => unknown) => fn())
    const manager: TransactionObservabilityManager = {
      ...buildManager(),
      runInSpanContext: runInSpanContext as TransactionObservabilityManager['runInSpanContext'],
    }

    expect(runInTransactionContext(manager, 'key', () => 'result')).toBe('result')
    expect(runInSpanContext).toHaveBeenCalledWith('key', expect.any(Function))
  })

  it('executes the function exactly once when it returns undefined', () => {
    const fn = vi.fn(() => undefined)

    expect(runInTransactionContext(buildManager(), 'key', fn)).toBeUndefined()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('passes through the value returned by the manager', () => {
    const manager: TransactionObservabilityManager = {
      ...buildManager(),
      runInSpanContext: <T>() => 'from-manager' as T,
    }

    expect(runInTransactionContext(manager, 'key', () => 'result')).toBe('from-manager')
  })
})
