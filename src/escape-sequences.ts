import { regexp } from './parser';

/**
 * Parse common escape sequences
 *
 * ```ts
 * escapeSequence.parseToEnd('\\n') // '\n'
 * ```
 */
export const escapeSequence = regexp(/\\[bfnrtv0'"\\]/y).map((value) => {
  switch (value) {
    case '\\b':
      return '\b';
    case '\\f':
      return '\f';
    case '\\n':
      return '\n';
    case '\\r':
      return '\r';
    case '\\t':
      return '\t';
    case '\\v':
      return '\v';
    case '\\0':
      return '\0';
    case "\\'":
      return "'";
    case '\\"':
      return '"';
    case '\\\\':
      return '\\';
    default:
      throw new Error(`Unhandled escape sequence: ${value}`);
  }
});
