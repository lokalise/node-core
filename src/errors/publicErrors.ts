import { constants as httpConstants } from 'node:http2'

import type { FreeformRecord } from '../common/commonTypes'

import { PublicNonRecoverableError } from './PublicNonRecoverableError'

export type CommonErrorParams = {
  message: string
  details?: FreeformRecord
  cause?: Error
}

export type OptionalMessageErrorParams = Partial<CommonErrorParams>

export type ValidationError = {
  message: string
  path: string[]
}

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
