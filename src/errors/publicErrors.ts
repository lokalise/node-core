import { constants as httpConstants } from 'node:http2'

import type { FreeformRecord } from '../common/commonTypes'

import { PublicNonRecoverableError } from './PublicNonRecoverableError'

/**
 * @deprecated Define the error with `definePublicError()` and `PublicError.from()` from `@lokalise/errors` instead.
 */
export type CommonErrorParams = {
  message: string
  details?: FreeformRecord
  cause?: Error
}

/**
 * @deprecated Define the error with `definePublicError()` and `PublicError.from()` from `@lokalise/errors` instead.
 */
export type OptionalMessageErrorParams = Partial<CommonErrorParams>

/**
 * @deprecated Define the error with `definePublicError()` and `PublicError.from()` from `@lokalise/errors` instead.
 */
export type ValidationError = {
  message: string
  path: string[]
}

/**
 * @deprecated Define the error with `definePublicError()` and `PublicError.from()` from `@lokalise/errors` instead.
 */
export class RequestValidationError extends PublicNonRecoverableError<{
  error: ValidationError[]
}> {
  constructor(errors: ValidationError[]) {
    super({
      message: 'Invalid params',
      errorCode: 'VALIDATION_ERROR',
      httpStatusCode: httpConstants.HTTP_STATUS_BAD_REQUEST,
      details: {
        error: errors,
      },
    })
  }
}

/**
 * @deprecated Define the error with `definePublicError()` and `PublicError.from()` from `@lokalise/errors` instead.
 */
export class AccessDeniedError extends PublicNonRecoverableError {
  constructor(params: CommonErrorParams) {
    super({
      message: params.message,
      errorCode: 'ACCESS_DENIED',
      httpStatusCode: httpConstants.HTTP_STATUS_FORBIDDEN,
      details: params.details,
      cause: params.cause,
    })
  }
}

/**
 * @deprecated Define the error with `definePublicError()` and `PublicError.from()` from `@lokalise/errors` instead.
 */
export class EntityNotFoundError extends PublicNonRecoverableError {
  constructor(params: CommonErrorParams) {
    super({
      message: params.message,
      errorCode: 'ENTITY_NOT_FOUND',
      httpStatusCode: httpConstants.HTTP_STATUS_NOT_FOUND,
      details: params.details,
      cause: params.cause,
    })
  }
}

/**
 * @deprecated Define the error with `definePublicError()` and `PublicError.from()` from `@lokalise/errors` instead.
 */
export class EntityGoneError extends PublicNonRecoverableError {
  constructor(params: CommonErrorParams) {
    super({
      message: params.message,
      errorCode: 'ENTITY_GONE',
      httpStatusCode: httpConstants.HTTP_STATUS_GONE,
      details: params.details,
    })
  }
}

/**
 * @deprecated Define the error with `definePublicError()` and `PublicError.from()` from `@lokalise/errors` instead.
 */
export class AuthFailedError extends PublicNonRecoverableError {
  constructor(params: OptionalMessageErrorParams = {}) {
    super({
      message: params.message ?? 'Authentication failed',
      errorCode: 'AUTH_FAILED',
      httpStatusCode: httpConstants.HTTP_STATUS_UNAUTHORIZED,
      details: params.details,
      cause: params.cause,
    })
  }
}
