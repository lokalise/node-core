export type ErrorDetails = Record<string, unknown>

export type BaseErrorParams = {
  message: string
  errorCode: string
  cause?: unknown
}
