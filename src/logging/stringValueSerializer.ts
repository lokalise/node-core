/**
 * Serializes the given value into a JSON string and explicitly wraps it in double quotes.
 * This ensures that log collectors (like Graylog) treat it as a string and not as a JSON object,
 * preventing the automatic extraction of properties that could lead to property explosion.
 */
export const stringValueSerializer = (value: unknown) => `"${JSON.stringify(value)}"`
