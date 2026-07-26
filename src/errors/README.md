# AppError

A type-safe, protocol-agnostic error handling system that improves upon the existing `InternalError` and `PublicNonRecoverableError` pattern.

## Why AppError?

### The Problem with InternalError and PublicNonRecoverableError

While the previous error system provided type-safe details through generics, it had critical limitations:

```typescript
// Old approach - type-safe details, but weak error code typing
class ProjectNotFoundError extends InternalError<{ name: string }> {
  constructor(name: string) {
    super({
      message: 'Project not found',
      errorCode: 'PROJECT_NOT_FOUND', // Just a string!
      details: { name },
    })
  }
}

class ProjectNameAlreadyExistsError extends InternalError<{ name: string }> {
  constructor(name: string) {
    super({
      message: 'Project already exists',
      errorCode: 'PROJECT_NAME_ALREADY_EXISTS', // Also just a string!
      details: { name },
    })
  }
}

// ❌ TypeScript CANNOT catch this error!
const test = (): ProjectNotFoundError => {
  return new ProjectNameAlreadyExistsError('some-project') // No type error!
}
```

**Issues:**
- ❌ **No error code type discrimination**: `errorCode` is just `string`, so TypeScript cannot distinguish between different error classes
- ❌ **HTTP-coupled**: `PublicNonRecoverableError` requires `httpStatusCode`, coupling errors to HTTP protocol
- ❌ **No schema for API contracts**: Error details couldn't be used to generate OpenAPI schemas or define strongly-typed API responses

### The AppError Solution

AppError addresses these issues through:

1. **✅ Literal error code types** - TypeScript can distinguish between error classes
2. **✅ Protocol-agnostic error types** - Map to HTTP, gRPC, or any protocol
3. **✅ Centralized error definitions** - Reusable, maintainable error specs
4. **✅ Zod schemas for OpenAPI & type safety** - Define strongly-typed API responses and generate documentation
5. **✅ Single unified class** - Public and internal errors use the same base class

## Core Concepts

### Protocol-Agnostic Error Types

AppError uses standardized error types that can be mapped to any protocol:

```typescript
export const ErrorType = {
  BAD_REQUEST: 'bad-request',       // HTTP 400 / gRPC INVALID_ARGUMENT
  UNAUTHENTICATED: 'unauthenticated', // HTTP 401 / gRPC UNAUTHENTICATED
  PERMISSION_DENIED: 'permission-denied', // HTTP 403 / gRPC PERMISSION_DENIED
  NOT_FOUND: 'not-found',           // HTTP 404 / gRPC NOT_FOUND
  CONFLICT: 'conflict',             // HTTP 409 / gRPC ALREADY_EXISTS
  RATE_LIMIT: 'rate-limit',         // HTTP 429 / gRPC RESOURCE_EXHAUSTED
  INTERNAL: 'internal',             // HTTP 500 / gRPC INTERNAL
  UNAVAILABLE: 'unavailable',       // HTTP 503 / gRPC UNAVAILABLE
} as const
```

Example HTTP mapping:
```typescript
const httpStatusByErrorType: Record<ErrorType, number> = {
  [ErrorType.BAD_REQUEST]: 400,
  [ErrorType.NOT_FOUND]: 404,
  // ...
}

// Access via getter
error.httpStatusCode // Returns appropriate HTTP status
```

You could similarly create a gRPC status mapping, message queue error codes, etc.

### Defining Errors with `defineError`

Use `defineError` to create error definitions with literal types:

```typescript
import { defineError, ErrorType, AppError } from './AppError'
import { z } from 'zod'

// Define your error
const projectNotFoundDef = defineError({
  code: 'PROJECT_NOT_FOUND', // This becomes a LITERAL type!
  type: ErrorType.NOT_FOUND,
  isPublic: true,
  detailsSchema: z.object({
    name: z.string(),
    organizationId: z.string().optional(),
  }),
})

// Create a class from the definition
export class ProjectNotFoundError extends AppError.from(projectNotFoundDef) {
  constructor(name: string, organizationId?: string) {
    super({
      message: 'Project with provided name was not found',
      details: { name, organizationId },
    })
  }
}
```

## Literal Error Code Types

The killer feature: TypeScript can now distinguish between different error classes.

### Type Discrimination

```typescript
const projectNotFoundDef = defineError({
  code: 'PROJECT_NOT_FOUND', // Literal type: 'PROJECT_NOT_FOUND'
  type: ErrorType.NOT_FOUND,
  isPublic: true,
  detailsSchema: z.object({ name: z.string() }),
})

const projectConflictDef = defineError({
  code: 'PROJECT_NAME_ALREADY_EXISTS', // Literal type: 'PROJECT_NAME_ALREADY_EXISTS'
  type: ErrorType.CONFLICT,
  isPublic: true,
  detailsSchema: z.object({ name: z.string() }),
})

export class ProjectNotFoundError extends AppError.from(projectNotFoundDef) {}
export class ProjectNameAlreadyExistsError extends AppError.from(projectConflictDef) {}

// ✅ TypeScript catches this error!
const test = (): ProjectNotFoundError => {
  return new ProjectNameAlreadyExistsError('some-project')
  // Error: Type 'ProjectNameAlreadyExistsError' is not assignable to type 'ProjectNotFoundError'
  // Types of property 'code' are incompatible
  // Type '"PROJECT_NAME_ALREADY_EXISTS"' is not assignable to type '"PROJECT_NOT_FOUND"'
}
```

This is impossible with the old approach where `errorCode: string`.

## Protocol Mapping Examples

### HTTP Mapping (Built-in)

```typescript
const error = new ProjectNotFoundError('my-project')
error.httpStatusCode // 404 (from ErrorType.NOT_FOUND)
```

### gRPC Mapping (Custom)

```typescript
import { status } from '@grpc/grpc-js'

const grpcStatusByErrorType: Record<ErrorType, status> = {
  [ErrorType.BAD_REQUEST]: status.INVALID_ARGUMENT,
  [ErrorType.UNAUTHENTICATED]: status.UNAUTHENTICATED,
  [ErrorType.PERMISSION_DENIED]: status.PERMISSION_DENIED,
  [ErrorType.NOT_FOUND]: status.NOT_FOUND,
  [ErrorType.CONFLICT]: status.ALREADY_EXISTS,
  [ErrorType.RATE_LIMIT]: status.RESOURCE_EXHAUSTED,
  [ErrorType.INTERNAL]: status.INTERNAL,
  [ErrorType.UNAVAILABLE]: status.UNAVAILABLE,
}

function toGrpcStatus(error: AppError<any>): status {
  return grpcStatusByErrorType[error.type]
}
```


## Advanced Patterns

### Optional vs Required Details

Errors without details don't require the details field:

```typescript
const rateLimitDef = defineError({
  code: 'RATE_LIMIT_EXCEEDED',
  type: ErrorType.RATE_LIMIT,
  isPublic: true,
  // No detailsSchema
})

export class RateLimitError extends AppError.from(rateLimitDef) {
  constructor() {
    super({
      message: 'Too many requests',
      // passing details is not allowed
    })
  }
}
```

Errors with schemas require details:

```typescript
const validationDef = defineError({
  code: 'VALIDATION_ERROR',
  type: ErrorType.BAD_REQUEST,
  isPublic: true,
  detailsSchema: z.object({
    fields: z.array(z.string()),
  }),
})

export class ValidationError extends AppError.from(validationDef) {
  constructor(fields: string[]) {
    super({
      message: 'Validation failed',
      details: { fields }, // Required by TypeScript!
    })
  }
}
```

## Migration Guide

### From InternalError

**Before:**
```typescript
class OldError extends InternalError<{ id: string }> {
  constructor(id: string) {
    super({
      message: 'Something failed',
      errorCode: 'SOMETHING_FAILED', // Just a string
      details: { id },
    })
  }
}
```

**After:**
```typescript
const somethingFailedDef = defineError({
  code: 'SOMETHING_FAILED', // Literal type!
  type: ErrorType.INTERNAL,
  isPublic: false,
  detailsSchema: z.object({
    id: z.string(),
  }),
})

export class SomethingFailedError extends AppError.from(somethingFailedDef) {
  constructor(id: string) {
    super({
      message: 'Something failed',
      details: { id },
    })
  }
}
```

### From PublicNonRecoverableError

**Before:**
```typescript
class OldPublicError extends PublicNonRecoverableError<{ id: string }> {
  constructor(id: string) {
    super({
      message: 'Not found',
      errorCode: 'NOT_FOUND',
      httpStatusCode: 404, // Coupled to HTTP!
      details: { id },
    })
  }
}
```

**After:**
```typescript
const notFoundDef = defineError({
  code: 'NOT_FOUND',
  type: ErrorType.NOT_FOUND, // Protocol-agnostic!
  isPublic: true,
  detailsSchema: z.object({
    id: z.string(),
  }),
})

export class NotFoundError extends AppError.from(notFoundDef) {
  constructor(id: string) {
    super({
      message: 'Not found',
      details: { id },
    })
    // httpStatusCode is automatically available if needed
  }
}
```

## Best Practices

1. **Use descriptive, unique error codes**: `PROJECT_NOT_FOUND` is better than `NOT_FOUND`
2. **Choose appropriate error types**: Use `NOT_FOUND` for missing resources, `BAD_REQUEST` for validation errors
3. **Leverage Zod for complex types**: Use unions, enums, and nested objects for rich type inference
4. **Mark public appropriately**: Only set `isPublic: true` for errors safe to expose externally
5. **Preserve error chains**: Use `cause` to maintain error context for debugging
6. **Create protocol mappings as needed**: HTTP, gRPC, message queues - map ErrorType to whatever you need
