import type { ZodSchema } from 'zod'

import { InternalError } from '../errors/InternalError'

import type { EnvValueValidator } from './configTypes'

export type EnvType = {
  [key: string]: string | undefined
}

export class ConfigScope {
  private env: EnvType

  constructor(envOverride?: EnvType) {
    this.env = envOverride ?? { ...process.env }
  }

  updateEnv() {
    // Accessing process.env values is slow, so we cache them
    this.env = { ...process.env }
  }

  getBySchema<T>(param: string, schema: ZodSchema<T>): T {
    const rawValue = this.env[param]

    const result = schema.safeParse(rawValue)

    if (!result.success) {
      throw new InternalError({
        message: `Validation of configuration parameter "${param}" has failed: ${result.error.issues.at(0)?.message}`,
        errorCode: 'CONFIGURATION_ERROR',
      })
    }

    return result.data
  }

  getMandatoryInteger(param: string): number {
    const rawValue = this.env[param]
    if (!rawValue) {
      throw new InternalError({
        message: `Missing mandatory configuration parameter: ${param}`,
        errorCode: 'CONFIGURATION_ERROR',
      })
    }
    return validateNumber(
      Number.parseInt(rawValue),
      `Configuration parameter ${param}\` must be an integer number, but was ${rawValue}`,
    )
  }

  getMandatoryNumber(param: string): number {
    const rawValue = this.env[param]
    if (!rawValue) {
      throw new InternalError({
        message: `Missing mandatory configuration parameter: ${param}`,
        errorCode: 'CONFIGURATION_ERROR',
      })
    }
    return validateNumber(
      Number.parseFloat(rawValue),
      `Configuration parameter ${param}\` must be a number, but was ${rawValue}`,
    )
  }

  getMandatory(param: string): string {
    const result = this.env[param]
    if (!result) {
      throw new InternalError({
        message: `Missing mandatory configuration parameter: ${param}`,
        errorCode: 'CONFIGURATION_ERROR',
      })
    }
    return result
  }

  getMandatoryOneOf<const T>(param: string, supportedValues: T[]): T {
    const result = this.getMandatory(param)
    return validateOneOf(
      result,
      supportedValues,
      `Unsupported ${param}: ${result}. Supported values: ${supportedValues.toString()}`,
    )
  }

  getMandatoryValidatedInteger(param: string, validator: EnvValueValidator<number>): number {
    const value = this.getMandatoryInteger(param)
    if (!validator(value)) {
      throw new InternalError({
        message: `Value ${value} is invalid for parameter ${param}`,
        errorCode: 'CONFIGURATION_ERROR',
      })
    }
    return value
  }

  getMandatoryValidatedNumber(param: string, validator: EnvValueValidator<number>): number {
    const value = this.getMandatoryNumber(param)
    if (!validator(value)) {
      throw new InternalError({
        message: `Value ${value} is invalid for parameter ${param}`,
        errorCode: 'CONFIGURATION_ERROR',
      })
    }
    return value
  }

  getOptionalNullable<T extends string | null | undefined>(
    param: string,
    defaultValue: T,
  ): T | string {
    return this.env[param] || defaultValue
  }

  getOptional(param: string, defaultValue: string): string {
    // Using the `||` operator instead of `??`, since '' is not a valid value, and 0 (number) is not expected here
    return this.env[param] || defaultValue
  }

  getOptionalInteger(param: string, defaultValue: number): number {
    const rawValue = this.env[param]
    if (!rawValue) {
      return defaultValue
    }
    return validateNumber(
      Number.parseInt(rawValue),
      `Configuration parameter ${param}\` must be a number, but was ${rawValue}`,
    )
  }

  getOptionalNumber(param: string, defaultValue: number): number {
    const rawValue = this.env[param]
    if (!rawValue) {
      return defaultValue
    }
    return validateNumber(
      Number.parseFloat(rawValue),
      `Configuration parameter ${param}\` must be a number, but was ${rawValue}`,
    )
  }

  getOptionalNullableInteger<T extends number | null | undefined>(
    param: string,
    defaultValue: T,
  ): T | number {
    const rawValue = this.env[param]
    if (!rawValue) {
      return defaultValue
    }
    return validateNumber(
      Number.parseInt(rawValue),
      `Configuration parameter ${param}\` must be an integer number, but was ${rawValue}`,
    )
  }

  getOptionalNullableNumber<T extends number | null | undefined>(
    param: string,
    defaultValue: T,
  ): T | number {
    const rawValue = this.env[param]
    if (!rawValue) {
      return defaultValue
    }
    return validateNumber(
      Number.parseFloat(rawValue),
      `Configuration parameter ${param}\` must be a number, but was ${rawValue}`,
    )
  }

  getOptionalOneOf<const T extends string>(
    param: string,
    defaultValue: T,
    supportedValues: T[],
  ): T {
    const result = this.getOptional(param, defaultValue)
    return validateOneOf(
      result,
      supportedValues,
      `Unsupported ${param}: ${result}. Supported values: ${supportedValues.toString()}`,
    )
  }

  getOptionalValidated(
    param: string,
    defaultValue: string,
    validator: EnvValueValidator<string>,
  ): string {
    const value = this.env[param] || defaultValue
    if (!validator(value)) {
      throw new InternalError({
        message: `Value ${value} is invalid for parameter ${param}`,
        errorCode: 'CONFIGURATION_ERROR',
      })
    }
    return value
  }

  getOptionalValidatedInteger(
    param: string,
    defaultValue: number,
    validator: EnvValueValidator<number>,
  ): number {
    const value = this.getOptionalInteger(param, defaultValue)

    if (!validator(value)) {
      throw new InternalError({
        message: `Value ${value} is invalid for parameter ${param}`,
        errorCode: 'CONFIGURATION_ERROR',
      })
    }

    return value
  }

  getOptionalValidatedNumber(
    param: string,
    defaultValue: number,
    validator: EnvValueValidator<number>,
  ): number {
    const value = this.getOptionalNumber(param, defaultValue)

    if (!validator(value)) {
      throw new InternalError({
        message: `Value ${value} is invalid for parameter ${param}`,
        errorCode: 'CONFIGURATION_ERROR',
      })
    }

    return value
  }

  getOptionalTransformed(
    param: string,
    defaultValue: string,
    transformer: (value: string) => string,
  ): string {
    const value = this.env[param] || defaultValue
    return transformer(value)
  }

  getOptionalNullableTransformed<T extends string | undefined>(
    param: string,
    defaultValue: T,
    transformer: (value: T | string) => T | string,
  ): T | string {
    const value = this.env[param] || defaultValue
    return transformer(value as T)
  }

  getMandatoryTransformed(param: string, transformer: (value: string) => string) {
    const value = this.getMandatory(param)

    return transformer(value)
  }

  getOptionalBoolean(param: string, defaultValue: boolean): boolean {
    const rawValue = this.env[param]?.toLowerCase()
    if (rawValue === undefined || rawValue === '') {
      return defaultValue
    }

    validateOneOf(rawValue, ['true', 'false'])

    return rawValue === 'true'
  }

  getMandatoryJsonObject<T extends object>(param: string, schema: ZodSchema<T>): T {
    const rawValue = this.getMandatory(param)
    return this.validateSchema(
      JSON.parse(rawValue),
      schema,
      `Configuration parameter ${param} must be a valid JSON meeting the given schema, but was ${rawValue}`,
    )
  }

  getOptionalNullableJsonObject<T extends object, Z extends T | null | undefined>(
    param: string,
    schema: ZodSchema<T>,
    defaultValue: Z,
  ): Z {
    const rawValue = this.getOptionalNullable(param, undefined)
    if (!rawValue) {
      return defaultValue
    }

    return this.validateSchema(
      JSON.parse(rawValue),
      schema,
      `Configuration parameter ${param} must be a valid JSON meeting the given schema, but was ${rawValue}`,
    ) as Z
  }

  getOptionalJsonObject<T extends object>(param: string, schema: ZodSchema<T>, defaultValue: T): T {
    return this.getOptionalNullableJsonObject(param, schema, defaultValue)
  }

  isProduction(): boolean {
    return this.env.NODE_ENV === 'production'
  }

  isDevelopment(): boolean {
    return this.env.NODE_ENV !== 'production'
  }

  isTest(): boolean {
    return this.env.NODE_ENV === 'test'
  }

  private validateSchema<T extends object>(
    value: unknown,
    schema: ZodSchema<T>,
    errorMessage: string,
  ): T {
    const parsedValue = schema.safeParse(value)
    if (!parsedValue.success) {
      throw new InternalError({
        message: errorMessage,
        errorCode: 'CONFIGURATION_ERROR',
        details: parsedValue.error,
      })
    }

    return parsedValue.data
  }
}

export function validateOneOf<const T>(
  validatedEntity: unknown,
  expectedOneOfEntities: T[],
  errorText?: string,
): T {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  if (!expectedOneOfEntities.includes(validatedEntity as T)) {
    throw new InternalError({
      message:
        errorText ||
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Validated entity ${validatedEntity} is not one of: ${expectedOneOfEntities.toString()}`,
      errorCode: 'CONFIGURATION_ERROR',
    })
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return validatedEntity as T
}

export function validateNumber(validatedObject: unknown, errorText: string): number {
  if (!Number.isFinite(validatedObject)) {
    throw new InternalError({
      message: errorText,
      errorCode: 'CONFIGURATION_ERROR',
    })
  }
  return validatedObject as number
}
