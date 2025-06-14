const PROTOTYPE_PATH_DELIMITER = '.'

const getPrototypeNamesPostError = (input: unknown): string[] => {
  const names: string[] = []

  const isFunction = typeof input === 'function'

  // biome-ignore lint/complexity/noBannedTypes: describes prototype
  let current: Function = isFunction ? input : Object.getPrototypeOf(input)

  while (current !== null) {
    const name = isFunction ? current.name : current.constructor.name

    if (!name) {
      break
    }

    names.push(name)
    current = Object.getPrototypeOf(current)
  }

  const reversedNames = names.reverse()

  const errorIndex = reversedNames.indexOf(Error.name)

  return reversedNames.slice(errorIndex + 1)
}

const generatePrototypePaths = (arr: string[]): string[] => {
  return arr.reduce<string[]>((acc, element) => {
    const prev = acc.at(-1)

    if (!prev) {
      acc.push(element)
    } else {
      acc.push(`${prev}${PROTOTYPE_PATH_DELIMITER}${element}`)
    }

    return acc
  }, [])
}

/**
 * Custom error class that enables reliable instanceof checks across realms
 * (e.g., iframes, workers, or Node.js VM).
 * Also ensures subclasses like `NotFoundError` have a consistent error name
 * (i.e., `error.name` is set to the subclass name instead of `EnhancedError`).
 *
 * It works by creating unique symbols for each inheritance path, such as:
 * - 'EnhancedError'
 * - 'EnhancedError.Subclass1'
 * - 'EnhancedError.Subclass1.Subclass2',
 * assigning them to the instance using `Symbol.for` on instantiation.
 * The custom `instanceof` logic (overriding `Symbol.hasInstance`) checks if the corresponding
 * symbol for the constructor’s prototype path exists on the tested object.
 *
 * This technique allows `instanceof` to succeed across realms where normal prototype chain checks fail,
 * because symbols created via `Symbol.for` are shared globally and can be reliably compared.
 */
export class EnhancedError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options)

    // Set the error's name to the name of the class that was instantiated
    this.name = new.target.name

    const prototypeNames = getPrototypeNamesPostError(this)
    const prototypePaths = generatePrototypePaths(prototypeNames)

    for (const prototypePath of prototypePaths) {
      const symbol = Symbol.for(prototypePath)

      Object.defineProperty(this, symbol, { value: true })
    }
  }

  static override [Symbol.hasInstance](val: unknown): boolean {
    if (val === null || typeof val !== 'object') {
      return false
    }

    // biome-ignore lint/complexity/noThisInStatic: intentional to support subclasses
    const prototypeNames = getPrototypeNamesPostError(this)
    const symbol = Symbol.for(prototypeNames.join(PROTOTYPE_PATH_DELIMITER))

    return symbol in val && val[symbol] === true
  }
}
