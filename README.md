# node-core 🧬

Core libraries for Node.js backend services.

* [Overview](#overview)  
* [HTTP Client](#http-client)  
* [Default Logging Configuration](#default-logging-configuration)  
* [ConfigScope](#configscope)  
* [Error Handling](#error-handling)  

See [docs](/docs) for further instructions on how to use.

## Overview

### Dependencies

* `pino`;
* `unidici`;
* `unidici-retry`.

## HTTP Client

The library provides methods to implement the client side of HTTP protocols. Public methods available are:

* `buildClient()`, which returns a [Client](https://undici.nodejs.org/#/docs/api/Client) instance and should be called before any of the following methods with parameters:
    * `baseUrl`;
    * `clientOptions` – set of [ClientOptions](https://undici.nodejs.org/#/docs/api/Client?id=parameter-clientoptions) (optional). If none are provided, the following default options will be used to instantiate the client:
        ```ts
        keepAliveMaxTimeout: 300_000,
        keepAliveTimeout: 4000,
        ```
* `sendGet()`;
* `sendPost()`;
* `sendPut()`;
* `sendPutBinary()`;
* `sendDelete()`;
* `sendPatch()`.

All _send_ methods accept a type parameter and the following arguments:
* `client`, the return value of `buildClient()`;
* `path`;
* `options` – (optional). Possible values are:
    * `headers`;
    * `query`;
    * `timeout`;
    * `throwOnError`;`
    * `reqContext`;
    * `safeParseJson`;
    * `disableKeepAlive`;`
    * `retryConfig`, defined by:
        * `maxAttempts`, the maximum number of times a request should be retried;
        * `delayBetweenAttemptsInMsecs`;
        * `statusCodesToRetry`, the status codes that trigger a retry;
        * `retryOnTimeout`;
    * `clientOptions`;
    * `responseSchema`;
    * `validateResponse`;
    
    The following options are applied by default:

    ```ts
    validateResponse: true,
    throwOnError: true,
    timeout: 30000,
    retryConfig: {
        maxAttemps: 1,
        delayBetweenAttemptsInMsecs: 0,
        statusCodesToRetry: [],
        retryOnTimeout: false,
    }
    ```

Additionally, `sendPost()`, `sendPut()`, `sendPutBinary()`, and `sendPatch()` also accept a `body` parameter.

The response of any _send_ method will be resolved to always have `result` set, but only have `error` set in case something went wrong. See [Either](#either) for more information.

## Default Logging Configuration

The library provides methods to resolve the default logging configuration. Public methods available are:

* `resolveLoggerConfiguration()`, which accepts as parameter an `appConfig`, defined by the `logLevel` and the `nodeEnv`. If the environment is production, the output will be logged in JSON format to be friendly with any data storage. Otherwise, the output will be logged with coloring and formatting to be visible for debugging purposes and help developers. 

    The method returns a logger configuration that should be used with `pino` library as in the following example:

    ```ts
    const loggerConfig = resolveLoggerConfiguration({
        logLevel: 'warn',
        nodeEnv: 'production',
    })

    const logger = pino(loggerConfig)
    ```

## ConfigScope

`ConfigScope` is a class that provides a way to encapsulate a single config source (e. g. `process.env`) and produce a set of values out of it, defining constraints and transformations for them.

Once the class is instantiated, you can leverage the following `ConfigScope` methods:

### Mandatory Configuration Parameters

* `getMandatory()`, returns the value of a mandatory configuration parameter. If the value is missing, an `InternalError` is thrown. Parameters are:
    * `param`, the configuration parameter name;
* `getMandatoryInteger()`, returns the value of a mandatory configuration parameter and validates that it is a number. If the value is missing or is not a number, an `InternalError` is thrown. Parameters are:
    * `param`, the configuration parameter name;
* `getMandatoryOneOf()`, returns the value a mandatory configuration parameter and validates that it is one of the supported values. If the value is missing or is not supported, an `InternalError` is thrown. Parameters are:
    * `param`, the configuration parameter name;
    * `supportedValues`;
* `getMandatoryValidatedInteger()`, similar to `getMandatoryInteger()`, but also takes a `validator` in input and will throw an `InternalError` if the number is not valid. See [Validators and Transformers](#validators-and-transformers) for more information. Parameters are:
    * `param`, the configuration parameter name;
    * `validator`;
* `getMandatoryTransformed()`, calls `getMandatory()` and returns the result of the `transformer` function applied to the configuration parameter value. See [Validators and Transformers](#validators-and-transformers) for more information. Parameters are:
    * `param`, the configuration parameter name;
    * `transformer`.

### Optional Configuration Parameters

* `getOptionalNullable()`, returns the value of an optional configuration parameter. If the value is missing, it is set to the provided default value.Parameters are:
    * `param`, the configuration parameter name;
    * `defaultValue`, which can be nullable;
* `getOptional()`, similar to `getOptionalNullable()`, but `defaultValue` cannot be nullable. The return value is always a string;
* `getOptionalIntegerNullable()`, returns the value of an optional configuration parameter and validates that it is a number. If the value is missing, it is set to the provided default value. If it is not a number, an `InternalError` is thrown. Parameters are:
    * `param`, the configuration parameter name;
    * `defaultValue`, which can be nullable;
* `getOptionalInteger`, similar to `getOptionalIntegerNullable()`, but `defaultValue` cannot be nullable. The return value is always a number;
* `getOptionalValidated()`, similar to `getOptional()`, but also takes a `validator` in input and will throw an `InternalError` if the value is not valid. See [Validators and Transformers](#validators-and-transformers) for more information. Parameters are:
    * `param`, the configuration parameter name;
    * `validator`;
* `getOptionalTransformed()`, similar to `getOptional()`, but also takes a `transformer` in input and the result of the `transformer` function applied to the configuration parameter value. See [Validators and Transformers](#validators-and-transformers) for more information. Parameters are:
    * `param`, the configuration parameter name;
    * `defaultValue`,
    * `transformer`;
* `getOptionalBoolean()`, returns the value of an optional configuration parameter and validates that it is a boolean. It the value is missing, it is assigned the `defaultValue`. If it is not a boolean, an `InternalError` is thrown. Parameters are:
    * `param`, the configuration parameter name;
    * `defaultValue`.

### Environment Configuration Parameter

* `isProduction()`, returns true if the environment is production;
* `isDevelopment()`, returns true if the environment is **not** production;
* `isTest()`, returns true if the environment is test.

----

### Validators and Transformers

Ad-hoc validators and transformers can be built leveraging the `EnvValueValidator` and the `EnvValueTransformer` types exposed by the library. Alternatively, the following validators and transformers are already provided out of the box:

#### Validators

* `createRangeValidator()`, which accepts `greaterOrEqualThan` and `lessOrEqualThan` and validates that a numeric value ranges between those numbers.

#### Transformers

* `ensureClosingSlashTransformer()`, which accepts a `value` as parameter, that can be a string or nullable, and adds a closing slash if it is missing and the value is defined.

## Error Handling

The library provides classes and methods for error handling.

### Gloabl Error Handler

Public methods to leverage a global error handler are provided to be used when the process is run outside of the context of the request (e. g. in a queue where no one would catch an error if thrown):
* `resolveGlobalErrorLogObject()`, which accepts `err` and optionally `correlationID` as parameters and converts the plain error into a serializable object. If the error is not a built-in `Error` type and doesn't have any message, a fixed string is returned instead;
* `executeAndHandleGlobalErrors()`, which accepts the `operation` parameter and will return the result of executing such operation. If an error is thrown during the execution of the operation, `resolveGlobalErrorLogObject()` is called to log the error and the process is terminated;
* `executeAsyncAndHandleGlobalErrors()`, which accepts `operation` and optionally `stopOnError` as parameters and will return the result of executing such operation **asynchronously**. If an error is thrown during the execution of the operation, `resolveGlobalErrorLogObject()` is called to log the error and the process is terminated only if `stopOnError` is `true`. `stopOnError` defaults to `true` if not provided.

### Errors

The library exposes classes for the following errors:
* `InternalError`, which issues a `500` status code and is not exposed in the global error handler. It expects the following parameters:
    * `message`;
    * `errorCode`;
    * `details` – (optional).
* `PublicNonRecoverableError`, which issues the HTTP status code provided and signals that the user did something wrong, hence the error is returned to the consumer of the API. It expects the following parameters:
    * `message`;
    * `errorCode`;
    * `details` – (optional);
    * `httpStatusCode` – (optional). Defaults to `500`;

### Either

The library provides the type `Either` for error handling in the functional paradigm. The two possible values are:
* `result` is defined, `error` is undefined;
* `error` is defined, `result` is undefined.

It's up to the caller of the function to handle the received error or throw an error.

Additionally, `DefineEither` is also provided. It is a variation of the aforementioned `Either`, which may or may not have `error` set, but always has `result`.