import { regexp } from './parser';

/**
 * Parse a boolean value (`true` or `false`)
 *
 * ```ts
 * boolean.parseToEnd('true') // true
 * ```
 */
export const boolean = regexp(/true\b|false\b/y).map((bool) =>
  bool === 'true' ? true : false
);
