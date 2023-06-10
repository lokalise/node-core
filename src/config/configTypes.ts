export type EnvValueValidator<InputType> = (value: InputType) => boolean
export type EnvValueTransformer<InputType, OutputType> = (value: InputType) => OutputType

export type RedisConfig = {
  host: string
  /**
   * An integer from 0 to 15, inclusive
   */
  db: number
  port: number
  username?: string
  password?: string
  commandTimeout?: boolean
  connectTimeout?: boolean
  useTls: boolean
}

export type AppConfig = {
  port: number
  bindAddress: string
  logLevel: string
  nodeEnv: 'production' | 'development' | 'test'
  appEnv: 'production' | 'development' | 'staging'
}
