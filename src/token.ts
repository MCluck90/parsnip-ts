import { Parser, regexp, zeroOrMore } from './parser';

/**
 * Create a parser for extracting a token.
 * Ignores anything matched by `ignore`
 *
 * ```ts
 * const token = createToken(whitespace)
 * const ifKeyword = token(/if/y)
 * keyword.matches('  if  ') // true
 * ```
 *
 * @param ignore Parser that matches content that should be ignored
 */
export const createToken = (ignore: Parser<unknown>) => (
  pattern: RegExp,
  message?: string
) =>
  zeroOrMore(ignore).and(
    regexp(pattern, message).bind((value) =>
      zeroOrMore(ignore).map(() => value)
    )
  );
