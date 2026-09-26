/** Outcome of a parse: the parts of a valid ID, or why it isn't one. */
export type Result<T, E extends string> = { valid: true; value: T } | { valid: false; error: E };
