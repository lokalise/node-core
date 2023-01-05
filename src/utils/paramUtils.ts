export function ensureClosingSlash<T extends string | undefined | null>(value: T): string {
  if (!value) {
    return ''
  }

  const lastChar = value.at(-1)
  if (lastChar !== '/') {
    return `${value}/`
  }
  return value
}
