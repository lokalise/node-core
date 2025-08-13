# node-core 🧬

Core libraries for Node.js backend services.

- [Default Logging Configuration](#default-logging-configuration)
- [ConfigScope](#configscope)
- [Error Handling](#error-handling)

See [docs](/docs) for further instructions on how to use.

## Default Logging Configuration

The library provides methods to resolve the default logging configuration. Public methods available are:

- `resolveLoggerConfiguration()`, which accepts as parameter an `appConfig`, defined by the `logLevel` and the `nodeEnv`. If the environment is production, the output will be logged in JSON format to be friendly with any data storage. Otherwise, the output will be logged with coloring and formatting to be visible for debugging purposes and help developers.

  The method returns a logger configuration that should be used with `pino` library as in the following example:

  ```ts
  const loggerConfig = resolveLoggerConfiguration({
    logLevel: 'warn',
    nodeEnv: 'production',
    redact: {
      paths: ['path1', 'path2'],
    },
  })

  const logger = pino(loggerConfig)
  ```

- `resolveMonorepoLoggerConfiguration()`, which accepts as parameter an `appConfig`, defined by the `logLevel` and the `nodeEnv`. It mostly behaves the same as `resolveLoggerConfiguration`, with the exception of execution in `development environments`. Since monorepo services are usually ran concurrently, logs from `stdout` aren't easily accessible. For this reason this logging configuration writes development logs into files.

  The method returns a logger configuration that should be used with `pino` library as in the following example:

  ```ts
  const loggerConfig = resolveMonorepoLoggerConfiguration({
    logLevel: 'warn',
    nodeEnv: 'production',
    append: false,
    // targetFile: './logs/service.log' -- optional parameter, you can specify exact path for writing logs
  })

  const logger = pino(loggerConfig)
  ```

## ConfigScope

`ConfigScope` is a class that provides a way to encapsulate a single config source (e. g. `process.env`) and produce a set of values out of it, defining constraints and transformations for them.

Once the class is instantiated, you can leverage the following `ConfigScope` methods:

### Configuration Parameters by zod schema

- `getBySchema()`, uses zod schema to validate configuration parameter, the returned type is inferred from the schema
  - `param`, the configuration parameter name;
  - `schema`, zod schema to use for parsing and validation;

> **Note:** Starting from version 14, the library requires Zod v4 API usage, to continue using Zod v3 API, please use version 13 of the library.

### Mandatory Configuration Parameters

- `getMandatory()`, returns the value of a mandatory configuration parameter. If the value is missing, an `InternalError` is thrown. Parameters are:
  - `param`, the configuration parameter name;
- `getMandatoryInteger()`, returns the value of a mandatory configuration parameter and validates that it is an integer number. If the value is missing or is not an integer, an `InternalError` is thrown. Parameters are:
  - `param`, the configuration parameter name;
- `getMandatoryNumber()`, returns the value of a mandatory configuration parameter and validates that it is a number. If the value is missing or is not a number, an `InternalError` is thrown. Parameters are:
  - `param`, the configuration parameter name;
- `getMandatoryOneOf()`, returns the value a mandatory configuration parameter and validates that it is one of the supported values. If the value is missing or is not supported, an `InternalError` is thrown. The method also serves as a type guard, narrowing the type of the passed value down to one of the supported options. Parameters are:
  - `param`, the configuration parameter name;
  - `supportedValues`;
- `getMandatoryValidatedInteger()`, similar to `getMandatoryInteger()`, but also takes a `validator` in input and will throw an `InternalError` if the number is not valid. See [Validators and Transformers](#validators-and-transformers) for more information. Parameters are:
  - `param`, the configuration parameter name;
  - `validator`;
- `getMandatoryValidatedNumber()`, similar to `getMandatoryNumber()`, but also takes a `validator` in input and will throw an `InternalError` if the number is not valid. See [Validators and Transformers](#validators-and-transformers) for more information. Parameters are:
  - `param`, the configuration parameter name;
  - `validator`;
- `getMandatoryTransformed()`, calls `getMandatory()` and returns the result of the `transformer` function applied to the configuration parameter value. See [Validators and Transformers](#validators-and-transformers) for more information. Parameters are:
  - `param`, the configuration parameter name;
  - `transformer`.

### Optional Configuration Parameters

- `getOptionalNullable()`, returns the value of an optional configuration parameter. If the value is missing, it is set to the provided default value.Parameters are:
  - `param`, the configuration parameter name;
  - `defaultValue`, which can be nullable;
- `getOptional()`, similar to `getOptionalNullable()`, but `defaultValue` cannot be nullable. The return value is always a string;
- `getOptionalNullableInteger()`, returns the value of an optional configuration parameter and validates that it is an integer number. If the value is missing, it is set to the provided default value. If it is not a number, an `InternalError` is thrown. Parameters are:
  - `param`, the configuration parameter name;
  - `defaultValue`, which can be nullable;
- `getOptionalNullableNumber()`, returns the value of an optional configuration parameter and validates that it is a number. If the value is missing, it is set to the provided default value. If it is not a number, an `InternalError` is thrown. Parameters are:
  - `param`, the configuration parameter name;
  - `defaultValue`, which can be nullable;
- `getOptionalInteger`, similar to `getOptionalNullableInteger()`, but `defaultValue` cannot be nullable. The return value is always a number;
- `getOptionalNumber`, similar to `getOptionalNullableNumber()`, but `defaultValue` cannot be nullable. The return value is always a number;
- `getOptionalValidated()`, similar to `getOptional()`, but also takes a `validator` in input and will throw an `InternalError` if the value is not valid. See [Validators and Transformers](#validators-and-transformers) for more information. Parameters are:
  - `param`, the configuration parameter name;
  - `validator`;
- `getOptionalValidatedInteger()`, similar to `getOptionalValidated()`, but expects and returns an integer `number` instead. See [Validators and Transformers](#validators-and-transformers) for more information. Parameters are:
  - `param`, the configuration parameter name;
  - `validator`;
- `getOptionalValidatedNumber()`, similar to `getOptionalValidated()`, but expects and returns `number` instead. See [Validators and Transformers](#validators-and-transformers) for more information. Parameters are:
  - `param`, the configuration parameter name;
  - `validator`;
- `getOptionalTransformed()`, similar to `getOptional()`, but also takes a `transformer` in input and the result of the `transformer` function applied to the configuration parameter value. See [Validators and Transformers](#validators-and-transformers) for more information. Parameters are:
  - `param`, the configuration parameter name;
  - `defaultValue`,
  - `transformer`;
- `getOptionalBoolean()`, returns the value of an optional configuration parameter and validates that it is a boolean. It the value is missing, it is assigned the `defaultValue`. If it is not a boolean, an `InternalError` is thrown. Parameters are:
  - `param`, the configuration parameter name;
  - `defaultValue`.
- `getOptionalOneOf()`, returns the value of an optional configuration parameter, if the value is missing, it falls back to the specified default value, and validates that it is one of the supported values. If the value is not supported, an `InternalError` is thrown. Parameters are:
  - `param`, the configuration parameter name;
  - `defaultValue`
  - `supportedValues`;

### Environment Configuration Parameter

- `isProduction()`, returns true if the environment is production;
- `isDevelopment()`, returns true if the environment is **not** production;
- `isTest()`, returns true if the environment is test.

---

### Validators and Transformers

Ad-hoc validators and transformers can be built leveraging the `EnvValueValidator` and the `EnvValueTransformer` types exposed by the library. Alternatively, the following validators and transformers are already provided out of the box:

#### Validators

- `createRangeValidator()`, which accepts `greaterOrEqualThan` and `lessOrEqualThan` and validates that a numeric value ranges between those numbers.

#### Transformers

- `ensureClosingSlashTransformer()`, which accepts a `value` as parameter, that can be a string or nullable, and adds a closing slash if it is missing and the value is defined.

## Error Handling

The library provides classes and methods for error handling.

### Global Error Handler

Public methods to leverage a global error handler are provided to be used when the process is run outside of the context of the request (e. g. in a queue where no one would catch an error if thrown):

- `resolveGlobalErrorLogObject()`, which accepts `err` and optionally `correlationID` as parameters and converts the plain error into a serializable object. If the error is not a built-in `Error` type and doesn't have any message, a fixed string is returned instead;
- `executeAndHandleGlobalErrors()`, which accepts the `operation` parameter and will return the result of executing such operation. If an error is thrown during the execution of the operation, `resolveGlobalErrorLogObject()` is called to log the error and the process is terminated;
- `executeAsyncAndHandleGlobalErrors()`, which accepts `operation` and optionally `stopOnError` as parameters and will return the result of executing such operation **asynchronously**. If an error is thrown during the execution of the operation, `resolveGlobalErrorLogObject()` is called to log the error and the process is terminated only if `stopOnError` is `true`. `stopOnError` defaults to `true` if not provided.

### Errors

The library exposes classes for the following errors:

- `InternalError`, which issues a `500` status code and is not exposed in the global error handler. It expects the following parameters:
  - `message`;
  - `errorCode`;
  - `details` – (optional);
  - `cause` – (optional).
- `PublicNonRecoverableError`, which issues the HTTP status code provided and signals that the user did something wrong, hence the error is returned to the consumer of the API. It expects the following parameters:
  - `message`;
  - `errorCode`;
  - `details` – (optional);
  - `cause` – (optional);
  - `httpStatusCode` – (optional). Defaults to `500`;

### Either

The library provides the type `Either` for error handling in the functional paradigm. The two possible values are:

- `result` is defined, `error` is undefined;
- `error` is defined, `result` is undefined.

It's up to the caller of the function to handle the received error or throw an error.

Read [this article](https://antman-does-software.com/stop-catching-errors-in-typescript-use-the-either-type-to-make-your-code-predictable) for more information on how `Either` works and its benefits.

Additionally, `DefiniteEither` is also provided. It is a variation of the aforementioned `Either`, which may or may not have `error` set, but always has `result`.

### waitAndRetry

There is helper function available for writing event-driven assertions in automated tests, which rely on something eventually happening:

```ts
import { waitAndRetry } from '@lokalise/node-core'

const result = await waitAndRetry(
  () => {
    return someEventEmitter.emittedEvents.length > 0
  },
  20, // sleepTime between attempts
  30, // maxRetryCount before timeout
)

expect(result).toBe(false) // resolves to what the last attempt has returned
expect(someEventEmitter.emittedEvents.length).toBe(1)
```

## Encryption

- `EncryptionUtility` - small class for encrypting/decrypting using aes-256-gcm. Adapted from: https://github.com/MauriceButler/cryptr

## Hashing

- `HashUtils` - utils for hashing using sha256/sha512 algorithms

## Checksum

- `ChecksumUtils` - utils for insecure hashing using the MD5 algorithm

## Streams

- `StreamUtils` - utils for temporary persisting of streams for length calculation and reuse
- `streamToBuffer` - utility for converting a stream to a buffer
