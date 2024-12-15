import { MultiTransactionObservabilityManager } from './MultiTransactionObservabilityManager'
import type { TransactionObservabilityManager } from './observabilityTypes'

describe('MultiTransactionObservabilityManager', () => {
  let multiTransactionObservabilityManager: MultiTransactionObservabilityManager
  let fakeTransactionManager1: FakeTransactionManager
  let fakeTransactionManager2: FakeTransactionManager

  beforeAll(() => {
    fakeTransactionManager1 = new FakeTransactionManager()
    fakeTransactionManager2 = new FakeTransactionManager()
    multiTransactionObservabilityManager = new MultiTransactionObservabilityManager([
      fakeTransactionManager1,
      fakeTransactionManager2,
    ])
  })

  it('start is being called on all managers', () => {
    const spy1 = vi.spyOn(fakeTransactionManager1, 'start')
    const spy2 = vi.spyOn(fakeTransactionManager2, 'start')

    multiTransactionObservabilityManager.start('transactionName', 'uniqueTransactionKey')

    expect(spy1).toHaveBeenCalledWith('transactionName', 'uniqueTransactionKey')
    expect(spy2).toHaveBeenCalledWith('transactionName', 'uniqueTransactionKey')
  })

  it('startWithGroup is being called on all managers', () => {
    const spy1 = vi.spyOn(fakeTransactionManager1, 'startWithGroup')
    const spy2 = vi.spyOn(fakeTransactionManager2, 'startWithGroup')

    multiTransactionObservabilityManager.startWithGroup(
      'transactionName',
      'uniqueTransactionKey',
      'group',
    )

    expect(spy1).toHaveBeenCalledWith('transactionName', 'uniqueTransactionKey', 'group')
    expect(spy2).toHaveBeenCalledWith('transactionName', 'uniqueTransactionKey', 'group')
  })

  it('addCustomAttrributes is being called on all managers', () => {
    const spy1 = vi.spyOn(fakeTransactionManager1, 'addCustomAttributes')
    const spy2 = vi.spyOn(fakeTransactionManager2, 'addCustomAttributes')

    multiTransactionObservabilityManager.addCustomAttributes('transactionName', { projectId: 'id' })

    expect(spy1).toHaveBeenCalledWith('transactionName', { projectId: 'id' })
    expect(spy2).toHaveBeenCalledWith('transactionName', { projectId: 'id' })
  })

  it.each([undefined, false, true])(
    'stop is being called on all managers, wasSuccessful: %s',
    (wasSuccessful) => {
      const spy1 = vi.spyOn(fakeTransactionManager1, 'stop')
      const spy2 = vi.spyOn(fakeTransactionManager2, 'stop')

      multiTransactionObservabilityManager.stop('uniqueTransactionKey', wasSuccessful)

      expect(spy1).toHaveBeenCalledWith('uniqueTransactionKey', wasSuccessful)
      expect(spy2).toHaveBeenCalledWith('uniqueTransactionKey', wasSuccessful)
    },
  )
})

class FakeTransactionManager implements TransactionObservabilityManager {
  start(): void {}
  startWithGroup(): void {}
  stop(): void {}
  addCustomAttributes(): void {}
}
