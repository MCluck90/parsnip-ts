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

  concat(parser: Parser<{ toString(): string }>): Parser<string> {
    return this.bind((value) =>
      parser.map((other) => value + other.toString())
    );
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

export const maybeWithDefault = <T>(
  parser: Parser<T>,
  defaultValue: T
): Parser<T> => parser.or(constant(defaultValue));

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

export const not = <T>(parser: Parser<T>, message?: string): Parser<null> =>
  new Parser((source) => {
    const result = parser.parse(source);
    if (!(result instanceof ParseError)) {
      return new ParseError(source.line, source.column, message);
    }
    return new ParseResult(null, source, source.line, source.column);
  });

export const repeat = <T>(
  parser: Parser<T>,
  count: number,
  message?: string
): Parser<T[]> =>
  new Parser((source) => {
    let result = parser.parse(source);
    if (result instanceof ParseError) {
      return new ParseError(
        source.line,
        source.column,
        message || result.message
      );
    }

    source = result.source;
    const values: T[] = [];
    for (let i = 1; i < count; i++) {
      result = parser.parse(source);
      if (result instanceof ParseError) {
        return new ParseError(
          source.line,
          source.column,
          message || result.message
        );
      }
      source = result.source;
      values.push(result.value);
    }
    return new ParseResult(values, source, source.line, source.column);
  });

export const lazy = <T>(getParser: () => Parser<T>): Parser<T> =>
  new Parser((source) => getParser().parse(source));

export const join = (
  parser: Parser<string[]>,
  separator = ''
): Parser<string> => parser.map((elements) => elements.join(separator));

export const boolean = regexp(/true\b|false\b/y).map((bool) =>
  bool === 'true' ? true : false
);

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

export const singleQuoteString = text("'").and(
  zeroOrMore(escapeSequence.or(regexp(/\\'|[^']/y))).bind((values) =>
    text("'").map(() => values.join(''))
  )
);
