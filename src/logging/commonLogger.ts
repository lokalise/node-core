import type { BaseLogger, Bindings, ChildLoggerOptions } from 'pino'

export type CommonLogger = BaseLogger & {
  /**
   * Creates a child logger, setting all key-value pairs in `bindings` as properties in the log lines. All serializers will be applied to the given pair.
   * Child loggers use the same output stream as the parent and inherit the current log level of the parent at the time they are spawned.
   * If a `level` property is present in the object passed to `child` it will override the child logger level.
   *
   * @param bindings: an object of key-value pairs to include in log lines as properties.
   * @param options: an options object that will override child logger inherited options.
   * @returns a child logger instance.
   */
  child(bindings: Bindings, options?: ChildLoggerOptions): CommonLogger

  /**
   * A utility method for determining if a given log level will write to the destination.
   */
  isLevelEnabled(level: string): boolean
}
