import type { Readable } from 'stream'

import { Client } from 'undici'
import type { FormData } from 'undici'
import type { RequestResult, RequestParams, RetryConfig } from 'undici-retry'
import { DEFAULT_RETRY_CONFIG, sendWithRetry } from 'undici-retry'

import { ResponseStatusError } from '../errors/ResponseStatusError'
import type { DefiniteEither, Either } from '../errors/either'
import { copyWithoutUndefined } from '../utils/objectUtils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecordObject = Record<string, any>

export type HttpRequestContext = {
  reqId: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResponseSchema<Output = any> = {
  parse(data: unknown): Output
}

export type RequestOptions<T> = {
  headers?: RecordObject
  query?: RecordObject
  timeout: number | undefined
  throwOnError?: boolean
  reqContext?: HttpRequestContext

  safeParseJson?: boolean
  blobResponseBody?: boolean
  requestLabel?: string

  disableKeepAlive?: boolean
  retryConfig?: RetryConfig
  clientOptions?: Client.Options
  responseSchema?: ResponseSchema<T>
  validateResponse: boolean
}

const DEFAULT_OPTIONS = {
  validateResponse: true,
  throwOnError: true,
  timeout: 30000,
} satisfies RequestOptions<unknown>

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
  options: Partial<RequestOptions<T>> = {},
): Promise<DefiniteEither<RequestResult<unknown>, RequestResult<T>>> {
  const result = await sendWithRetry<T>(
    client,
    {
      ...DEFAULT_OPTIONS,
      path: path,
      method: 'GET',
      query: options.query,
      headers: copyWithoutUndefined({
        'x-request-id': options.reqContext?.reqId,
        ...options.headers,
      }),
      reset: options.disableKeepAlive ?? false,
      bodyTimeout: options.timeout,
      throwOnError: false,
    },
    resolveRetryConfig(options),
    resolveRequestConfig(options),
  )

  return resolveResult(
    result,
    options.throwOnError ?? DEFAULT_OPTIONS.throwOnError,
    options.validateResponse ?? DEFAULT_OPTIONS.validateResponse,
    options.responseSchema,
    options.requestLabel,
  )
}

export async function sendDelete<T>(
  client: Client,
  path: string,
  options: Partial<RequestOptions<T>> = {},
): Promise<DefiniteEither<RequestResult<unknown>, RequestResult<T>>> {
  const result = await sendWithRetry<T>(
    client,
    {
      ...DEFAULT_OPTIONS,
      path,
      method: 'DELETE',
      query: options.query,
      headers: copyWithoutUndefined({
        'x-request-id': options.reqContext?.reqId,
        ...options.headers,
      }),
      reset: options.disableKeepAlive ?? false,
      bodyTimeout: options.timeout,
      throwOnError: false,
    },
    resolveRetryConfig(options),
    resolveRequestConfig(options),
  )

  return resolveResult(
    result,
    options.throwOnError ?? DEFAULT_OPTIONS.throwOnError,
    options.validateResponse ?? DEFAULT_OPTIONS.validateResponse,
    options.responseSchema,
  )
}

export async function sendPost<T>(
  client: Client,
  path: string,
  body: RecordObject | undefined,
  options: Partial<RequestOptions<T>> = {},
): Promise<DefiniteEither<RequestResult<unknown>, RequestResult<T>>> {
  const result = await sendWithRetry<T>(
    client,
    {
      ...DEFAULT_OPTIONS,
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
      throwOnError: false,
    },
    resolveRetryConfig(options),
    resolveRequestConfig(options),
  )

  return resolveResult(
    result,
    options.throwOnError ?? DEFAULT_OPTIONS.throwOnError,
    options.validateResponse ?? DEFAULT_OPTIONS.validateResponse,
    options.responseSchema,
  )
}

export async function sendPostBinary<T>(
  client: Client,
  path: string,
  body: Buffer | Uint8Array | Readable | FormData | null,
  options: Partial<RequestOptions<T>> = {},
): Promise<DefiniteEither<RequestResult<unknown>, RequestResult<T>>> {
  const result = await sendWithRetry<T>(
    client,
    {
      ...DEFAULT_OPTIONS,
      path: path,
      method: 'POST',
      body,
      query: options.query,
      headers: copyWithoutUndefined({
        'x-request-id': options.reqContext?.reqId,
        ...options.headers,
      }),
      reset: options.disableKeepAlive ?? false,
      bodyTimeout: options.timeout,
      throwOnError: false,
    },
    resolveRetryConfig(options),
    resolveRequestConfig(options),
  )

  return resolveResult(
    result,
    options.throwOnError ?? DEFAULT_OPTIONS.throwOnError,
    options.validateResponse ?? DEFAULT_OPTIONS.validateResponse,
    options.responseSchema,
  )
}

export async function sendPut<T>(
  client: Client,
  path: string,
  body: RecordObject | undefined,
  options: Partial<RequestOptions<T>> = {},
): Promise<DefiniteEither<RequestResult<unknown>, RequestResult<T>>> {
  const result = await sendWithRetry<T>(
    client,
    {
      ...DEFAULT_OPTIONS,
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
      throwOnError: false,
    },
    resolveRetryConfig(options),
    resolveRequestConfig(options),
  )

  return resolveResult(
    result,
    options.throwOnError ?? DEFAULT_OPTIONS.throwOnError,
    options.validateResponse ?? DEFAULT_OPTIONS.validateResponse,
    options.responseSchema,
  )
}

export async function sendPutBinary<T>(
  client: Client,
  path: string,
  body: Buffer | Uint8Array | Readable | FormData | null,
  options: Partial<RequestOptions<T>> = {},
): Promise<DefiniteEither<RequestResult<unknown>, RequestResult<T>>> {
  const result = await sendWithRetry<T>(
    client,
    {
      ...DEFAULT_OPTIONS,
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
      throwOnError: false,
    },
    resolveRetryConfig(options),
    resolveRequestConfig(options),
  )

  return resolveResult(
    result,
    options.throwOnError ?? DEFAULT_OPTIONS.throwOnError,
    options.validateResponse ?? DEFAULT_OPTIONS.validateResponse,
    options.responseSchema,
  )
}

export async function sendPatch<T>(
  client: Client,
  path: string,
  body: RecordObject | undefined,
  options: Partial<RequestOptions<T>> = {},
): Promise<DefiniteEither<RequestResult<unknown>, RequestResult<T>>> {
  const result = await sendWithRetry<T>(
    client,
    {
      ...DEFAULT_OPTIONS,
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
      throwOnError: false,
    },
    resolveRetryConfig(options),
    resolveRequestConfig(options),
  )

  return resolveResult(
    result,
    options.throwOnError ?? DEFAULT_OPTIONS.throwOnError,
    options.validateResponse ?? DEFAULT_OPTIONS.validateResponse,
    options.responseSchema,
  )
}

function resolveRequestConfig(options: Partial<RequestOptions<unknown>>): RequestParams {
  return {
    safeParseJson: options.safeParseJson ?? false,
    blobBody: options.blobResponseBody ?? false,
    throwOnInternalError: true,
    requestLabel: options.requestLabel,
  }
}

function resolveRetryConfig(options: Partial<RequestOptions<unknown>>): RetryConfig {
  return options.retryConfig ?? DEFAULT_RETRY_CONFIG
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
  throwOnError: boolean,
  validateResponse: boolean,
  validationSchema?: ResponseSchema,
  requestLabel?: string,
): DefiniteEither<RequestResult<unknown>, RequestResult<T>> {
  // Throw response error
  if (requestResult.error && throwOnError) {
    throw new ResponseStatusError(requestResult.error, requestLabel)
  }
  if (requestResult.result && validateResponse && validationSchema) {
    requestResult.result.body = validationSchema.parse(requestResult.result.body)
  }

  return requestResult as DefiniteEither<RequestResult<unknown>, RequestResult<T>>
}

export const httpClient = {
  get: sendGet,
  post: sendPost,
  put: sendPut,
  patch: sendPatch,
  del: sendDelete,
}
