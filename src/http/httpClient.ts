import type { Readable } from 'stream'

import { request } from 'undici'
import type { Dispatcher, FormData } from 'undici'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecordObject = Record<string, any>

export type HttpRequestContext = {
  reqId: string
}

export type GetRequestOptions = {
  headers?: RecordObject
  query?: RecordObject
  timeout?: number
  throwOnError?: boolean
  reqContext?: HttpRequestContext
}

export type DeleteRequestOptions = GetRequestOptions

export type RequestOptions = {
  headers?: RecordObject
  query?: RecordObject
  timeout?: number
  throwOnError?: boolean
  reqContext?: HttpRequestContext
}

const defaultOptions: GetRequestOptions = {
  throwOnError: true,
  timeout: 30000,
}

export type Response<T> = {
  body: T
  headers: RecordObject
  statusCode: number
}

export async function sendGet<T>(
  baseUrl: string,
  path: string,
  options: GetRequestOptions = defaultOptions,
): Promise<Response<T>> {
  const url = resolveUrl(baseUrl, path)
  const response = await request(url, {
    method: 'GET',
    query: options.query,
    headers: {
      'x-request-id': options.reqContext?.reqId,
      ...options.headers,
    },
    bodyTimeout: options.timeout,
    throwOnError: options.throwOnError,
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const resolvedBody = await resolveBody(response)

  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    body: resolvedBody,
    headers: response.headers,
    statusCode: response.statusCode,
  }
}

export async function sendDelete<T>(
  baseUrl: string,
  path: string,
  options: DeleteRequestOptions = defaultOptions,
): Promise<Response<T>> {
  const url = resolveUrl(baseUrl, path)
  const response = await request(url, {
    method: 'DELETE',
    query: options.query,
    headers: {
      'x-request-id': options.reqContext?.reqId,
      ...options.headers,
    },
    bodyTimeout: options.timeout,
    throwOnError: options.throwOnError,
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const resolvedBody = await resolveBody(response)

  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    body: resolvedBody,
    headers: response.headers,
    statusCode: response.statusCode,
  }
}

export async function sendPost<T>(
  baseUrl: string,
  path: string,
  body: RecordObject | undefined,
  options: RequestOptions = defaultOptions,
): Promise<Response<T>> {
  const url = resolveUrl(baseUrl, path)
  const response = await request(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    query: options.query,
    headers: {
      'x-request-id': options.reqContext?.reqId,
      ...options.headers,
    },
    bodyTimeout: options.timeout,
    throwOnError: options.throwOnError,
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const resolvedBody = await resolveBody(response)

  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    body: resolvedBody,
    headers: response.headers,
    statusCode: response.statusCode,
  }
}

export async function sendPut<T>(
  baseUrl: string,
  path: string,
  body: RecordObject | undefined,
  options: RequestOptions = defaultOptions,
): Promise<Response<T>> {
  const url = resolveUrl(baseUrl, path)
  const response = await request(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    query: options.query,
    headers: {
      'x-request-id': options.reqContext?.reqId,
      ...options.headers,
    },
    bodyTimeout: options.timeout,
    throwOnError: options.throwOnError,
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const resolvedBody = await resolveBody(response)

  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    body: resolvedBody,
    headers: response.headers,
    statusCode: response.statusCode,
  }
}

export async function sendPutBinary<T>(
  baseUrl: string,
  path: string,
  body: Buffer | Uint8Array | Readable | null | FormData,
  options: RequestOptions = defaultOptions,
): Promise<Response<T>> {
  const url = resolveUrl(baseUrl, path)
  const response = await request(url, {
    method: 'PUT',
    body,
    query: options.query,
    headers: {
      'x-request-id': options.reqContext?.reqId,
      ...options.headers,
    },
    bodyTimeout: options.timeout,
    throwOnError: options.throwOnError,
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const resolvedBody = await resolveBody(response)

  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    body: resolvedBody,
    headers: response.headers,
    statusCode: response.statusCode,
  }
}

export async function sendPatch<T>(
  baseUrl: string,
  path: string,
  body: RecordObject | undefined,
  options: RequestOptions = defaultOptions,
): Promise<Response<T>> {
  const url = resolveUrl(baseUrl, path)
  const response = await request(url, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
    query: options.query,
    headers: {
      'x-request-id': options.reqContext?.reqId,
      ...options.headers,
    },
    bodyTimeout: options.timeout,
    throwOnError: options.throwOnError,
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const resolvedBody = await resolveBody(response)

  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    body: resolvedBody,
    headers: response.headers,
    statusCode: response.statusCode,
  }
}

async function resolveBody(response: Dispatcher.ResponseData) {
  const contentType = response.headers['content-type']
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return !contentType || contentType?.startsWith('application/json')
    ? await response.body.json()
    : await response.body.text()
}

function resolveUrl(baseUrl: string, path: string): string {
  return new URL(path, baseUrl).href
}

export const httpClient = {
  get: sendGet,
  post: sendPost,
  put: sendPut,
  patch: sendPatch,
  del: sendDelete,
}
