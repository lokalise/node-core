import type { Readable } from 'stream'

import { Client } from 'undici'
import type { FormData } from 'undici'
import type { RequestResult, RetryConfig } from 'undici-retry'
import { DEFAULT_RETRY_CONFIG, sendWithRetry } from 'undici-retry'

import { copyWithoutUndefined } from '../utils/objectUtils'
import { Either } from '../errors/either'
import { InternalError } from '../errors/InternalError'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecordObject = Record<string, any>

export type HttpRequestContext = {
  reqId: string
}

export type RequestOptions = {
  headers?: RecordObject
  query?: RecordObject
  timeout?: number
  throwOnError?: boolean
  reqContext?: HttpRequestContext
  safeParseJson?: boolean
  disableKeepAlive?: boolean
  retryConfig?: Omit<RetryConfig, 'safeParseJson'>
  clientOptions?: Client.Options
}

const defaultOptions: RequestOptions = {
  throwOnError: true,
  timeout: 30000,
}

const defaultClientOptions: Partial<Client.Options> = {
  keepAliveMaxTimeout: 300_000,
  keepAliveTimeout: 4000,
}

export type Response<T> = {
  body: T
  headers: RecordObject
  statusCode: number
}

export async function sendGet<T>(
  client: Client,
  path: string,
  options: RequestOptions = defaultOptions,
): Promise<Either<RequestResult<unknown>, RequestResult<T>>> {
  const result = await sendWithRetry<T>(
    client,
    {
      path: path,
      method: 'GET',
      query: options.query,
      headers: copyWithoutUndefined({
        'x-request-id': options.reqContext?.reqId,
        ...options.headers,
      }),
      reset: options.disableKeepAlive ?? false,
      bodyTimeout: options.timeout,
      throwOnError: options.throwOnError,
    },
    resolveRetryConfig(options),
  )

  return resolveResult(result, options)
}

export async function sendDelete<T>(
  client: Client,
  path: string,
  options: RequestOptions = defaultOptions,
): Promise<Either<RequestResult<unknown>, RequestResult<T>>> {
  const result = await sendWithRetry<T>(
    client,
    {
      path,
      method: 'DELETE',
      query: options.query,
      headers: copyWithoutUndefined({
        'x-request-id': options.reqContext?.reqId,
        ...options.headers,
      }),
      reset: options.disableKeepAlive ?? false,
      bodyTimeout: options.timeout,
      throwOnError: options.throwOnError,
    },
    resolveRetryConfig(options),
  )

  return resolveResult(result, options)
}

export async function sendPost<T>(
  client: Client,
  path: string,
  body: RecordObject | undefined,
  options: RequestOptions = defaultOptions,
): Promise<Either<RequestResult<unknown>, RequestResult<T>>> {
  const result = await sendWithRetry<T>(
    client,
    {
      path: path,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      query: options.query,
      headers: copyWithoutUndefined({
        'x-request-id': options.reqContext?.reqId,
        ...options.headers,
      }),
      reset: options.disableKeepAlive ?? false,
      bodyTimeout: options.timeout,
      throwOnError: options.throwOnError,
    },
    resolveRetryConfig(options),
  )
  return resolveResult(result, options)
}

export async function sendPut<T>(
  client: Client,
  path: string,
  body: RecordObject | undefined,
  options: RequestOptions = defaultOptions,
): Promise<Either<RequestResult<unknown>, RequestResult<T>>> {
  const result = await sendWithRetry<T>(
    client,
    {
      path: path,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      query: options.query,
      headers: copyWithoutUndefined({
        'x-request-id': options.reqContext?.reqId,
        ...options.headers,
      }),
      reset: options.disableKeepAlive ?? false,
      bodyTimeout: options.timeout,
      throwOnError: options.throwOnError,
    },
    resolveRetryConfig(options),
  )
  return resolveResult(result, options)
}

export async function sendPutBinary<T>(
  client: Client,
  path: string,
  body: Buffer | Uint8Array | Readable | null | FormData,
  options: RequestOptions = defaultOptions,
): Promise<Either<RequestResult<unknown>, RequestResult<T>>> {
  const result = await sendWithRetry<T>(
    client,
    {
      path: path,
      method: 'PUT',
      body,
      query: options.query,
      headers: copyWithoutUndefined({
        'x-request-id': options.reqContext?.reqId,
        ...options.headers,
      }),
      reset: options.disableKeepAlive ?? false,
      bodyTimeout: options.timeout,
      throwOnError: options.throwOnError,
    },
    resolveRetryConfig(options),
  )
  return resolveResult(result, options)
}

export async function sendPatch<T>(
  client: Client,
  path: string,
  body: RecordObject | undefined,
  options: RequestOptions = defaultOptions,
): Promise<Either<RequestResult<unknown>, RequestResult<T>>> {
  const result = await sendWithRetry<T>(
    client,
    {
      path: path,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      query: options.query,
      headers: copyWithoutUndefined({
        'x-request-id': options.reqContext?.reqId,
        ...options.headers,
      }),
      reset: options.disableKeepAlive ?? false,
      bodyTimeout: options.timeout,
      throwOnError: options.throwOnError,
    },
    resolveRetryConfig(options),
  )
  return resolveResult(result, options)
}

function resolveRetryConfig(options: RequestOptions): RetryConfig {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return options.retryConfig
    ? {
        ...options.retryConfig,
        safeParseJson: options.safeParseJson ?? false,
      }
    : {
        ...DEFAULT_RETRY_CONFIG,
        safeParseJson: options.safeParseJson ?? false,
      }
}

export function buildClient(baseUrl: string, clientOptions?: Client.Options) {
  const newClient = new Client(baseUrl, {
    ...defaultClientOptions,
    ...clientOptions,
  })
  return newClient
}

function resolveResult<T>(
  requestResult: Either<RequestResult<unknown>, RequestResult<T>>,
  options: RequestOptions,
) {
  if (requestResult.error && options.throwOnError) {
    throw new InternalError({
      message: `Request error ${requestResult.error.statusCode}`,
      details: {
        response: requestResult.error,
      },
      errorCode: 'REQUEST_ERROR',
    })
  }
  return requestResult
}

export const httpClient = {
  get: sendGet,
  post: sendPost,
  put: sendPut,
  patch: sendPatch,
  del: sendDelete,
}
