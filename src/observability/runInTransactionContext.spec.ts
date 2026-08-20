import type { TransactionObservabilityManager } from './observabilityTypes'
import { runInTransactionContext } from './runInTransactionContext'

describe('runInTransactionContext', () => {
  const buildManager = (): TransactionObservabilityManager => ({
    start: () => {},
    startWithGroup: () => {},
    stop: () => {},
    addCustomAttributes: () => {},
  })

  const buildPropagatingManager = (): TransactionObservabilityManager => ({
    ...buildManager(),
    runInSpanContext: <T>(_uniqueTransactionKey: string, fn: () => T): T => fn(),
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

  it.each([undefined, null])(
    'executes the function exactly once when it returns %s and context cannot be propagated',
    (returnValue) => {
      const fn = vi.fn(() => returnValue)

      expect(runInTransactionContext(buildManager(), 'key', fn)).toBe(returnValue)
      expect(fn).toHaveBeenCalledTimes(1)
    },
  )

  it.each([undefined, null])(
    'executes the function exactly once when it returns %s and context is propagated',
    (returnValue) => {
      const fn = vi.fn(() => returnValue)

      expect(runInTransactionContext(buildPropagatingManager(), 'key', fn)).toBe(returnValue)
      expect(fn).toHaveBeenCalledTimes(1)
    },
  )

  it('passes through the value returned by the manager', () => {
    const manager: TransactionObservabilityManager = {
      ...buildManager(),
      runInSpanContext: <T>() => 'from-manager' as T,
    }

    expect(runInTransactionContext(manager, 'key', () => 'result')).toBe('from-manager')
  })
})
