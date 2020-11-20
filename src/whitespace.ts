import { regexp } from './parser';

/**
 * Matches one or more whitespace characters
 *
 * ```ts
 * whitespace.matches(' \r\n\t') // true
 * ```
 */
export const whitespace = regexp(/\s+/y);

/**
 * Matches zero or more whitespace characters
 *
 * ```ts
 * ws.matches(' \r\n\t') // true
 * ws.matches('') // true
 * ```
 */
export const ws = regexp(/\s*/y);
