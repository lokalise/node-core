import type { Readable } from 'stream'

import { Client } from 'undici'
import type { Dispatcher, FormData } from 'undici'

import { InternalError } from '../errors/InternalError'
import { copyWithoutUndefined } from '../utils/objectUtils'

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
): Promise<Response<T>> {
  const response = await client.request({
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
  })

  const resolvedBody = await resolveBody(response, options.safeParseJson)

  return {
    body: resolvedBody,
    headers: response.headers,
    statusCode: response.statusCode,
  }
}

export async function sendDelete<T>(
  client: Client,
  path: string,
  options: RequestOptions = defaultOptions,
): Promise<Response<T>> {
  const response = await client.request({
    path: path,
    method: 'DELETE',
    query: options.query,
    headers: copyWithoutUndefined({
      'x-request-id': options.reqContext?.reqId,
      ...options.headers,
    }),
    reset: options.disableKeepAlive ?? false,
    bodyTimeout: options.timeout,
    throwOnError: options.throwOnError,
  })

  const resolvedBody = await resolveBody(response, options.safeParseJson)

  return {
    body: resolvedBody,
    headers: response.headers,
    statusCode: response.statusCode,
  }
}

export async function sendPost<T>(
  client: Client,
  path: string,
  body: RecordObject | undefined,
  options: RequestOptions = defaultOptions,
): Promise<Response<T>> {
  const response = await client.request({
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
  })

  const resolvedBody = await resolveBody(response, options.safeParseJson)

  return {
    body: resolvedBody,
    headers: response.headers,
    statusCode: response.statusCode,
  }
}

export async function sendPut<T>(
  client: Client,
  path: string,
  body: RecordObject | undefined,
  options: RequestOptions = defaultOptions,
): Promise<Response<T>> {
  const response = await client.request({
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
  })

  const resolvedBody = await resolveBody(response, options.safeParseJson)

  return {
    body: resolvedBody,
    headers: response.headers,
    statusCode: response.statusCode,
  }
}

export async function sendPutBinary<T>(
  client: Client,
  path: string,
  body: Buffer | Uint8Array | Readable | null | FormData,
  options: RequestOptions = defaultOptions,
): Promise<Response<T>> {
  const response = await client.request({
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
  })

  const resolvedBody = await resolveBody(response, options.safeParseJson)

  return {
    body: resolvedBody,
    headers: response.headers,
    statusCode: response.statusCode,
  }
}

export async function sendPatch<T>(
  client: Client,
  path: string,
  body: RecordObject | undefined,
  options: RequestOptions = defaultOptions,
): Promise<Response<T>> {
  const response = await client.request({
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
  })

  const resolvedBody = await resolveBody(response, options.safeParseJson)

  return {
    body: resolvedBody,
    headers: response.headers,
    statusCode: response.statusCode,
  }
}

async function resolveBody(response: Dispatcher.ResponseData, safeParseJson = false) {
  // There can never be multiple content-type headers, see https://www.rfc-editor.org/rfc/rfc7230#section-3.2.2
  const contentType = response.headers['content-type'] as string | undefined
  if (contentType?.startsWith('application/json')) {
    if (!safeParseJson) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await response.body.json()
    }
    const rawBody = await response.body.text()
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(rawBody)
    } catch (err) {
      throw new InternalError({
        message: 'Error while parsing HTTP JSON response',
        errorCode: 'INVALID_HTTP_RESPONSE_JSON',
        details: {
          rawBody,
        },
      })
    }
  }
  return await response.body.text()
}

export function buildClient(baseUrl: string, clientOptions?: Client.Options) {
  const newClient = new Client(baseUrl, {
    ...defaultClientOptions,
    ...clientOptions,
  })
  return newClient
}

export const httpClient = {
  get: sendGet,
  post: sendPost,
  put: sendPut,
  patch: sendPatch,
  del: sendDelete,
}
