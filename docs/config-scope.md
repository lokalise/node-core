# ConfigScope

ConfigScope provides a way to encapsulate a single config source (e. g. `process.env`), and produce a set of values out of it, defining constraints and transformations for them.

## Basic usage

```ts
process.env.value = '123'
// If no explicit source is provided, { ...process.env } is the default.
const configScope = new ConfigScope()

const resolvedValue = configScope.getMandatory('value')
console.log(resolvedValue) // this outputs "123"

const resolvedNumericValue = configScope.getMandatoryInteger('value')
console.log(resolvedNumericValue) // this outputs 123

const resolvedOptionalValue = configScope.getOptional('value2', 'defaultValue')
console.log(resolvedOptionalValue) // this outputs "defaultValue"
```
