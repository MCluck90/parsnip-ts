import { Parser, regexp, zeroOrMore } from './parser';

export const createToken = (ignore: Parser<unknown>) => (
  pattern: RegExp,
  message?: string
) =>
  zeroOrMore(ignore).and(
    regexp(pattern, message).bind((value) =>
      zeroOrMore(ignore).map(() => value)
    )
  );
