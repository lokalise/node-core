import type { BaseLogger, Bindings, ChildLoggerOptions } from 'pino'

export type CommonLogger = BaseLogger & {
  child(bindings: Bindings, options?: ChildLoggerOptions): CommonLogger
}
