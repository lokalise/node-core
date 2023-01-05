export type EnvValueValidator = (value: string | undefined | null) => boolean
export type EnvValueTransformer<InputType, OutputType> = (value: InputType) => OutputType

export type RedisConfig = {
  host: string
  db: number // can be 0-15
  port: number
  username?: string
  password?: string
  useTls: boolean
}

export type AppConfig = {
  port: number
  bindAddress: string
  logLevel: string
  nodeEnv: 'production' | 'development' | 'test'
  appEnv: 'production' | 'development' | 'staging'
}
