export type EnvValueValidator<InputType> = (value: InputType) => boolean
export type EnvValueTransformer<InputType, OutputType> = (value: InputType) => OutputType

export type RedisConfig = {
  host: string
  /**
   * An integer from 0 to 15, inclusive
   */
  db?: number
  keyPrefix?: string
  port: number
  username?: string
  password?: string
  commandTimeout?: number
  connectTimeout?: number
  /**
   * Set this option explicitly to null for infinite retries
   * By default (for undefined) there are 20 retries, see: https://redis.github.io/ioredis/interfaces/CommonRedisOptions.html#maxRetriesPerRequest
   */
  maxRetriesPerRequest?: number | null
  enableReadyCheck?: boolean
  lazyConnect?: boolean
  useTls: boolean
}

export type AppConfig = {
  port: number
  bindAddress: string
  logLevel: string
  nodeEnv: 'production' | 'development' | 'test'
  appEnv: 'production' | 'development' | 'staging'
}
