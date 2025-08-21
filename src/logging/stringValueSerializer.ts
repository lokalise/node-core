/**
 * Serializes the given value into a JSON string and explicitly wraps it in double quotes.
 * This ensures that log collectors (like Graylog) treat it as a string and not as a JSON object,
 * preventing the automatic extraction of properties that could lead to property explosion.
 * Max length is set to 8100 (+4 for quotes) characters to prevent issues with log collectors
 * (Graylog) that have a limit of 32766 bytes per field. In the worst case scenario, each character
 * is 4 bytes (UTF-32), so we limit the string to 8100 characters to stay within the limit.
 */
export const stringValueSerializer = (value: unknown, maxLength = 8100): string => {
  const baseValue = valueToString(value)

  const truncated = baseValue.length > maxLength ? baseValue.slice(0, maxLength) : baseValue

  return typeof value === 'string' ? `""${truncated}""` : `"${truncated}"`
}

const valueToString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (typeof value === 'symbol') {
    return value.toString()
  }

  if (value === undefined) {
    return 'undefined'
  }

  if (typeof value === 'function') {
    return value.toString()
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value) // fallback for circular references etc.
  }
}
