import { ParseError } from './error';
import { ParseResult, Source } from './source';

export interface Parser<T> {
  parse(source: Source): ParseResult<T> | null;
}

export class Parser<T> {
  constructor(public parse: (source: Source) => ParseResult<T> | null) {}

  and<U>(parser: Parser<U>): Parser<U> {
    return this.bind(() => parser);
  }

  bind<U>(map: (value: T) => Parser<U>): Parser<U> {
    return new Parser((source) => {
      const result = this.parse(source);
      if (result) {
        const { value, source } = result;
        return map(value).parse(source);
      }
      return null;
    });
  }

  map<U>(map: (t: T) => U): Parser<U> {
    return this.bind((value) => constant(map(value)));
  }

  or<U>(parser: Parser<T | U>): Parser<T | U> {
    return new Parser((source) => this.parse(source) ?? parser.parse(source));
  }

  parseStringToCompletion(str: string): T {
    const source = new Source(str, 0);
    const result = this.parse(source);
    if (result === null) {
      throw new ParseError('Parse error', source.line, source.column);
    }

    const index = result.source.index;
    if (index !== result.source.source.length) {
      throw new ParseError(
        'Incomplete parse',
        result.source.line,
        result.source.column
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
  new Parser((source) => {
    throw new ParseError(message, source.line, source.column);
  });

export const maybe = <T>(parser: Parser<T | null>): Parser<T | null> =>
  parser.or(constant(null));

export const regexp = (regexp: RegExp): Parser<string> =>
  new Parser((source) => source.match(regexp));

export const zeroOrMore = <T>(parser: Parser<T>): Parser<T[]> =>
  new Parser((source) => {
    const results = [];
    let item = null;
    while ((item = parser.parse(source))) {
      source = item.source;
      results.push(item.value);
    }
    return new ParseResult(results, source, source.line, source.column);
  });

export const oneOrMore = <T>(parser: Parser<T>): Parser<T[]> =>
  new Parser((source) => {
    const results = [];
    let item = parser.parse(source);
    if (item === null) {
      return null;
    }
    source = item.source;
    results.push(item.value);
    while ((item = parser.parse(source))) {
      source = item.source;
      results.push(item.value);
    }
    return new ParseResult(results, source, source.line, source.column);
  });
