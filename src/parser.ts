import { ParseError } from './error';
import { ParseResult, Source } from './source';

export interface Parser<T> {
  parse(source: Source): ParseResult<T> | ParseError;
}

export class Parser<T> {
  constructor(public parse: (source: Source) => ParseResult<T> | ParseError) {}

  and<U>(parser: Parser<U>): Parser<U> {
    return this.bind(() => parser);
  }

  bind<U>(map: (value: T) => Parser<U>): Parser<U> {
    return new Parser((source) => {
      const result = this.parse(source);
      if (result instanceof ParseError) {
        return result;
      }
      return map(result.value).parse(result.source);
    });
  }

  map<U>(map: (t: T) => U): Parser<U> {
    return this.bind((value) => constant(map(value)));
  }

  or<U>(parser: Parser<T | U>): Parser<T | U> {
    return new Parser((source) => {
      const result = this.parse(source);
      if (result instanceof ParseError) {
        return parser.parse(source);
      }
      return result;
    });
  }

  parseStringToCompletion(str: string): T | ParseError {
    const source = new Source(str, 0);
    const result = this.parse(source);
    if (result instanceof ParseError) {
      return result;
    }

    const index = result.source.index;
    if (index !== result.source.source.length) {
      return new ParseError(
        result.source.line,
        result.source.column,
        'Incomplete parse',
        'end of input',
        result.source.getRemaining()
      );
    }

    return result.value;
  }
}

export const constant = <T>(value: T): Parser<T> =>
  new Parser(
    (source) => new ParseResult(value, source, source.line, source.column)
  );

export const error = <T>(message: string): Parser<T> =>
  new Parser((source) => new ParseError(source.line, source.column, message));

export const maybe = <T>(parser: Parser<T | null>): Parser<T | null> =>
  parser.or(constant(null));

export const regexp = (regexp: RegExp, message?: string): Parser<string> =>
  new Parser((source) => source.match(regexp, message));

export const zeroOrMore = <T>(parser: Parser<T>): Parser<T[]> =>
  new Parser((source) => {
    const results = [];
    let item = parser.parse(source);
    while (!(item instanceof ParseError)) {
      source = item.source;
      results.push(item.value);
      item = parser.parse(source);
    }
    return new ParseResult(results, source, source.line, source.column);
  });

export const oneOrMore = <T>(
  parser: Parser<T>,
  message?: string
): Parser<T[]> =>
  new Parser((source) => {
    const results = [];
    let item = parser.parse(source);
    if (item instanceof ParseError) {
      return new ParseError(item.line, item.column, message || item.message);
    }

    source = item.source;
    results.push(item.value);
    item = parser.parse(source);
    while (!(item instanceof ParseError)) {
      source = item.source;
      results.push(item.value);
      item = parser.parse(source);
    }
    return new ParseResult(results, source, source.line, source.column);
  });

export const text = (text: string, message?: string): Parser<string> =>
  new Parser((source) => source.text(text, message));

export const whitespace = regexp(/\s+/y);

export const comments = regexp(/[/][/].*/y).or(regexp(/[/][*].*[*][/]/sy));

export const ignored = zeroOrMore(whitespace.or(comments));

export const token = (pattern: RegExp) =>
  regexp(pattern).bind((value) => ignored.and(constant(value)));

export const integer = token(/0|[1-9][0-9_]+/y).map((digits) =>
  parseInt(digits.replace(/_/g, ''))
);

export const boolean = token(/true\b|false\b/y).map((bool) =>
  bool === 'true' ? true : false
);
