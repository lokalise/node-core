import { constants as httpConstants } from 'node:http2'

import type { FreeformRecord } from '../common/commonTypes'

import { PublicNonRecoverableError } from './PublicNonRecoverableError'

export type CommonErrorParams = {
  message: string
  details?: FreeformRecord
}

export type OptionalMessageErrorParams = {
  message?: string
  details?: FreeformRecord
}

export type ValidationError = {
  message: string
  path: string[]
}

export class RequestValidationError extends PublicNonRecoverableError {
  constructor(errors: ValidationError[]) {
    super({
      message: 'Invalid params',
      errorCode: 'VALIDATION_ERROR',
      httpStatusCode: 400,
      details: {
        error: errors,
      },
    })
  }
}

export class EntityNotFoundError extends PublicNonRecoverableError {
  constructor(params: CommonErrorParams) {
    super({
      message: params.message,
      errorCode: 'ENTITY_NOT_FOUND',
      httpStatusCode: 404,
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
    })
  }
}
