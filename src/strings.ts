import { escapeSequence } from './escape-sequences';
import { regexp, text } from './parser';

const string = (delimiter: string) => {
  const stringRegex = new RegExp(`(?:[^${delimiter}\\\\]|\\\\.)*`, 'y');
  return text(delimiter)
    .and(escapeSequence.or(regexp(stringRegex)))
    .bind((str) => text(delimiter).map(() => str));
};

/**
 * Match a string surrounded with single quotes
 *
 * ```ts
 * singleQuoteString.matches("'hello'") // true
 * ```
 */
export const singleQuoteString = string("'");

/**
 * Match a string surrounded with double quotes
 *
 * ```ts
 * doubleQuoteString.matches('"hello"') // true
 * ```
 */
export const doubleQuoteString = string('"');
