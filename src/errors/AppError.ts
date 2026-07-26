import type { z } from 'zod'
import { EnhancedError } from './EnhancedError'

type ValueOf<T> = T[keyof T]

/**
 * Protocol-agnostic error type categorization.
 *
 * Error types are not coupled to any specific protocol and can be mapped to
 * HTTP status codes, gRPC status, message queue error codes, etc.
 */
export const ErrorType = {
  /** Invalid request or validation error */
  BAD_REQUEST: 'bad-request',
  /** Authentication required or failed */
  UNAUTHENTICATED: 'unauthenticated',
  /** Insufficient permissions */
  PERMISSION_DENIED: 'permission-denied',
  /** Resource not found */
  NOT_FOUND: 'not-found',
  /** Resource conflict or already exists */
  CONFLICT: 'conflict',
  /** Rate limit exceeded */
  RATE_LIMIT: 'rate-limit',
  /** Internal server error */
  INTERNAL: 'internal',
  /** Service unavailable */
  UNAVAILABLE: 'unavailable',
} as const

/**
 * Union type of all error type values.
 */
export type ErrorType = ValueOf<typeof ErrorType>

/**
 * Maps error types to HTTP status codes.
 *
 * This is one example of protocol mapping - you can create similar mappings
 * for gRPC status codes, message queue error codes, etc.
 *
 * @internal
 */
const httpStatusByErrorType: Record<ErrorType, number> = {
  [ErrorType.BAD_REQUEST]: 400,
  [ErrorType.UNAUTHENTICATED]: 401,
  [ErrorType.PERMISSION_DENIED]: 403,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.CONFLICT]: 409,
  [ErrorType.RATE_LIMIT]: 429,
  [ErrorType.INTERNAL]: 500,
  [ErrorType.UNAVAILABLE]: 503,
}

/**
 * Structure of an error definition.
 *
 * Reusable specifications that combine:
 * - Unique error code (used for type discrimination)
 * - Error type category (for protocol mapping)
 * - Public/internal visibility flag
 * - Optional Zod schema for type-safe error details and OpenAPI generation
 */
export interface ErrorDefinition {
  /** Unique error code - becomes a literal type for type discrimination */
  code: string
  /** Error type category for protocol-agnostic error handling */
  type: ErrorType
  /** Whether this error is safe to expose to external consumers */
  isPublic: boolean
  /** Optional Zod schema for type inference and OpenAPI schema generation */
  detailsSchema?: z.ZodTypeAny
}

/**
 * Creates an error definition with preserved literal types.
 *
 * The const type parameter ensures error codes remain literal types rather than
 * widening to string, enabling TypeScript type discrimination.
 *
 * @param def - Error definition object
 * @returns Same definition with literal types preserved
 */
export const defineError = <const T extends ErrorDefinition>(def: T): T => def

/**
 * Infers the TypeScript type of error details from a Zod schema.
 *
 * If the error definition has a detailsSchema, this extracts the TypeScript
 * type using Zod's inference. If no schema is defined, returns undefined.
 *
 * @internal
 */
type InferDetails<TDef extends ErrorDefinition> = TDef['detailsSchema'] extends z.ZodTypeAny
  ? z.infer<TDef['detailsSchema']>
  : undefined

/**
 * Options for constructing an AppError instance.
 *
 * Uses conditional types to make details field optional when no schema is defined,
 * and required when a schema is present.
 *
 * @template TDetails - Inferred type of error details from Zod schema
 */
export type AppErrorOptions<TDetails = undefined> = {
  /** Human-readable error message */
  message: string
  /** Optional underlying cause for error chaining */
  cause?: unknown
} & (undefined extends TDetails ? { details?: TDetails } : { details: TDetails })

/**
 * Type-safe application error with literal error codes and protocol-agnostic error types.
 *
 * Key features:
 * - Literal error codes enable TypeScript type discrimination between different error classes
 * - Protocol-agnostic error types can map to HTTP status codes, gRPC status, etc.
 * - Zod schemas provide type inference for error details and enable OpenAPI schema generation
 * - Single class handles both public and internal errors via isPublic flag
 *
 * @template T - Error definition with literal code type
 */
export class AppError<T extends ErrorDefinition> extends EnhancedError {
  /** Literal error code for type discrimination */
  readonly code: T['code']
  /** Protocol-agnostic error type */
  readonly type: T['type']
  /** Whether error details are safe to expose externally */
  readonly isPublic: T['isPublic']
  /** Type-safe error details inferred from Zod schema */
  readonly details?: InferDetails<T>

  private constructor(definition: T, options: AppErrorOptions<InferDetails<T>>) {
    super(options.message, { cause: options.cause })

    this.code = definition.code
    this.type = definition.type
    this.isPublic = definition.isPublic
    this.details = options.details
  }

  /**
   * Creates an error class from an error definition.
   *
   * Preserves literal types from the definition, enabling type discrimination.
   * The returned class constructor requires details if detailsSchema is defined.
   *
   * @param definition - Error definition with const assertion for literal types
   * @returns Error class with definition bound
   */
  static from<const T extends ErrorDefinition>(definition: T) {
    return class extends AppError<T> {
      constructor(options: AppErrorOptions<InferDetails<T>>) {
        super(definition, options)
      }
    }
  }

  /**
   * HTTP status code derived from error type.
   *
   * Automatically maps ErrorType to appropriate HTTP status without
   * requiring manual specification per error instance.
   *
   * @returns HTTP status code
   */
  get httpStatusCode(): number {
    return httpStatusByErrorType[this.type]
  }
}
