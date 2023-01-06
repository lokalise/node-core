import { InternalError } from '../errors/InternalError'

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

  getMandatoryOneOf<T>(param: string, supportedValues: T[]): T {
    const result = this.getMandatory(param)
    return validateOneOf(
      result,
      supportedValues,
      `Unsupported ${param}: ${result}. Supported values: ${supportedValues.toString()}`,
    )
  }

  getOptionalNullable<T extends string | null | undefined>(
    param: string,
    defaultValue: T,
  ): T | string {
    return this.env[param] ?? defaultValue
  }

  getOptionalValidated(
    param: string,
    defaultValue: string,
    validator: (value: string) => boolean,
  ): string {
    const value = this.env[param] ?? defaultValue
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
    const value = this.env[param] ?? defaultValue
    return transformer(value)
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

  isProduction(): boolean {
    return this.env.NODE_ENV === 'production'
  }

  isDevelopment(): boolean {
    return this.env.NODE_ENV !== 'production'
  }

  isTest(): boolean {
    return this.env.NODE_ENV === 'test'
  }
}

export function validateOneOf<T>(
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
