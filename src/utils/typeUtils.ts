import type { InternalError } from '../errors/InternalError'

export type StandardizedError = {
  code: string
  message: string
}

export function hasMessage(maybe: unknown): maybe is { message: string } {
  return isObject(maybe) && typeof maybe.message === 'string'
}

export function isObject(maybeObject: unknown): maybeObject is Record<PropertyKey, unknown> {
  return typeof maybeObject === 'object' && maybeObject !== null
}

export function isStandardizedError(error: unknown): error is StandardizedError {
  return isObject(error) && typeof error.errorCode === 'string' && typeof error.message === 'string'
}

export function isInternalError(error: unknown): error is InternalError {
  return isObject(error) && error.name === 'InternalError'
}

export function isPublicNonRecoverableError(error: unknown): error is InternalError {
  return isObject(error) && error.name === 'PublicNonRecoverableError'
}