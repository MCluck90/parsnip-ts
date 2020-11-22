import { ParseError } from './error';
import { ParseResult, Source } from './source';

export type ParseFunction<T> = (source: Source) => ParseResult<T> | ParseError;

export class Parser<T> {
  /**
   * The core parser which provides functions for combining parsers
   * @param parse Defines how to parse source
   */
  constructor(public parse: ParseFunction<T>) {}

  /**
   * Run a parser after this one, discarding this ones value
   *
   * ```ts
   * text('a').and(text('b')).bind(value =>
   *   assert(value === 'b')
   * )
   * ```
   *
   * @param parser Parser to run next
   */
  and<U>(parser: Parser<U>): Parser<U> {
    return this.bind(() => parser);
  }

  /**
   * Captures the result of this parser and bind another parser
   *
   * ```ts
   * const parser = regexp(/\d/y).bind(digit => text(`${digit}abc`))
   * parser.matches('11abc') // true
   * parser.matches('99abc') // true
   * ```
   *
   * @param map Map value to another parser
   */
  bind<U>(map: (value: T) => Parser<U>): Parser<U> {
    return new Parser((source) => {
      const result = this.parse(source);
      if (result instanceof ParseError) {
        return result;
      }
      return map(result.value).parse(result.source);
    });
  }

  /**
   * Concatenates using any toString-able parser
   *
   * ```ts
   * const parser = text('a').concat(regexp(/\d/y))
   * parser.parseToEnd('a1') // 'a1'
   * ```
   *
   * @param parser Parser which parses a toString-able value
   */
  concat(parser: Parser<{ toString(): string }>): Parser<string> {
    return this.bind((value) =>
      parser.map((other) => value + other.toString())
    );
  }

  /**
   * Maps the result of a parser to a different value
   *
   * ```ts
   * const parser = regexp(/\d/y).map(Number)
   * parser.parseToEnd('1') // 1
   * ```
   *
   * @param map Mapping function
   */
  map<U>(map: (t: T) => U): Parser<U> {
    return this.bind((value) => constant(map(value)));
  }

  /**
   * Attempts to match the alternative parser if this one fails.
   * Returns the value of whichever was successful
   *
   * ```ts
   * const parser = text('a').or(integer)
   * parse.parseToEnd('a') // 'a'
   * parse.parseToEnd('123') // 123
   * ```
   *
   * @param parser Alternative parser
   */
  or<U>(parser: Parser<T | U>): Parser<T | U> {
    return new Parser((source) => {
      const result = this.parse(source);
      if (result instanceof ParseError) {
        return parser.parse(source);
      }
      return result;
    });
  }

  /**
   * Attempts to parse a string to the end.
   * Fails if the parser does not parse the entire input
   *
   * ```ts
   * const parser = text('a')
   * parser.parseToEnd('a') // 'a'
   * parse.parseToEnd('a1') instanceof ParseError // true
   * ```
   *
   * @param str Input string
   */
  parseToEnd(str: string): T | ParseError {
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
        source,
        'end of input',
        result.source.getRemaining()
      );
    }

    return result.value;
  }

  /**
   * Returns true if the parser can parse the given string
   *
   * ```ts
   * const parser = text('a')
   * parser.matches('a') // true
   * parser.matches('b') // false
   * ```
   *
   * @param str Input
   */
  matches(str: string): boolean {
    const source = new Source(str, 0);
    const result = this.parse(source);
    return !(result instanceof ParseError);
  }

  /**
   * Returns true if the parse can parse the given string to the end
   *
   * ```ts
   * const parser = text('a')
   * parser.matchesToEnd('a') // true
   * parser.matchesToEnd('ab') // false
   * ```
   *
   * @param str Input
   */
  matchesToEnd(str: string): boolean {
    const result = this.parseToEnd(str);
    return !(result instanceof ParseError);
  }
}

/**
 * A parser that always succeeds and returns a constant value
 *
 * ```ts
 * constant('hello').parseToEnd('') // 'hello'
 * ```
 *
 * @param value Value to return
 */
export const constant = <T>(value: T): Parser<T> =>
  new Parser(
    (source) => new ParseResult(value, source, source.line, source.column)
  );

/**
 * Generate an error
 *
 * ```ts
 * const result = error('Error message').parseToEnd('')
 * result instanceof ParseError // true
 * result.message // 'Error message'
 * ```
 *
 * @param message Error message
 */
export const error = <T>(message: string): Parser<T> =>
  new Parser(
    (source) => new ParseError(source.line, source.column, message, source)
  );

/**
 * Attempts to parse using `parser`. Returns `null` if `parser` fails
 *
 * ```ts
 * const parser = maybe(text('a'))
 * parser.matches('a') // true
 * parser.matches('') // true
 * parser.parseToEnd('a') // 'a'
 * parser.parseToEnd('') // null
 * ```
 *
 * @param parser Parser to execute
 */
export const maybe = <T>(parser: Parser<T>): Parser<T | null> =>
  parser.or(constant(null));

/**
 * Attempts to parse using `parser`. Returns a default value if it fails
 *
 * ```ts
 * const parser = maybeWithDefault(text('a'), 'b')
 * parser.parseToEnd('a') // 'a'
 * parser.parseToEnd('') // 'b'
 * ```
 *
 * @param parser Parser to execute
 * @param defaultValue Default value to return if `parser` fails
 */
export const maybeWithDefault = <T>(
  parser: Parser<T>,
  defaultValue: T
): Parser<T> => parser.or(constant(defaultValue));

/**
 * Match against a regular expression.
 * Regular expressions _must_ be sticky (ex: `/\d/y`)
 *
 * ```ts
 * const parser = regexp(/d+/y)
 * parser.matches('12345') // true
 * ```
 *
 * @param regexp Regular expression to match with
 * @param message Error message, if it fails
 */
export const regexp = (regexp: RegExp, message?: string): Parser<string> =>
  new Parser((source) => source.match(regexp, message));

/**
 * Attempt to match a parser zero or more times
 *
 * ```ts
 * const parser = zeroOrMore(regexp(/\d/y))
 * parser.parseToEnd('') // []
 * parser.parseToEnd('123') // ['1', '2', '3']
 * ```
 *
 * @param parser Parser to use
 */
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

/**
 * Match a parser one or more times
 *
 * ```ts
 * const parser = oneOrMore(regexp(/\d/y))
 * parser.parseToEnd('') // ParseError
 * parser.parseToEnd('123') // ['1', '2', '3']
 * ```
 *
 * @param parser Parser to use
 * @param message Error message, if it fails
 */
export const oneOrMore = <T>(
  parser: Parser<T>,
  message?: string
): Parser<T[]> =>
  new Parser((source) => {
    const results = [];
    let item = parser.parse(source);
    if (item instanceof ParseError) {
      return new ParseError(
        item.line,
        item.column,
        message || item.message,
        source
      );
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

/**
 * Match a literal string
 *
 * ```ts
 * const parser = text('a')
 * parser.matches('a') // true
 * ```
 *
 * @param text String to match
 * @param message Error message, if it fails
 */
export const text = (text: string, message?: string): Parser<string> =>
  new Parser((source) => source.text(text, message));

/**
 * Returns an error if the given parser succeeds
 *
 * ```ts
 * const parser = not(regexp(/d/y))
 * parser.matches('1') // false
 * parser.parseToEnd('a') // null
 * ```
 *
 * @param parser Parser which should fail
 * @param message Error message, if it succeeds
 */
export const not = <T>(parser: Parser<T>, message?: string): Parser<null> =>
  new Parser((source) => {
    const result = parser.parse(source);
    if (!(result instanceof ParseError)) {
      return new ParseError(source.line, source.column, message, source);
    }
    return new ParseResult(null, source, source.line, source.column);
  });

/**
 * Repeat a parser a set number of times
 *
 * ```ts
 * const parser = repeat(regexp(/d/y), 4)
 * parser.matches('1234') // true
 * parser.parseToEnd('1234') // ['1', '2', '3', '4']
 * ```
 *
 * @param parser Parser to execute
 * @param count Number of times to execute it
 * @param message Error message, if it fails
 */
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
        message || result.message,
        source
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
          message || result.message,
          source
        );
      }
      source = result.source;
      values.push(result.value);
    }
    return new ParseResult(values, source, source.line, source.column);
  });

/**
 * Lazily evaluate a parser. Useful for rules which are self-referential
 *
 * ```ts
 * let digit: Parser<string> = error('Not yet defined')
 * const parser = lazy(() => digit)
 * digit = regexp(/d/y)
 * parser.matches('1') // true
 * ```
 *
 * @param getParser Returns the parser to use
 */
export const lazy = <T>(getParser: () => Parser<T>): Parser<T> =>
  new Parser((source) => getParser().parse(source));

/**
 * Join together an array of strings
 *
 * ```ts
 * const threeAs = repeat(text('a', 3))
 * threeAs.parseToEnd('aaa') // ['a', 'a', 'a']
 *
 * const joined = join(threeAs)
 * joined.parseToEnd('aaa') // 'aaa'
 * ```
 *
 * @param parser Parser which returns a set of string
 * @param separator What the elements should be separated with
 */
export const join = (
  parser: Parser<string[]>,
  separator = ''
): Parser<string> => parser.map((elements) => elements.join(separator));

/**
 * Parses a list of elements separated by a common separator
 *
 * ```ts
 * const digit = regexp(/d/y)
 * const parser = list(digit, text(','))
 * parser.parseToEnd('1,2,3') // [1, 2, 3]
 * ```
 * @param elementParser Parser for each element of the list
 * @param separatorParser Parser for the separator in the list
 */
export const list = <T, U>(
  elementParser: Parser<T>,
  separatorParser: Parser<U>
): Parser<T[]> =>
  elementParser.bind((first) =>
    zeroOrMore(separatorParser.and(elementParser)).map((rest) => [
      first,
      ...rest,
    ])
  );

/**
 * Parse a pair of items and return them as a tuple
 *
 * ```ts
 * const keyValue = pair(key, value)
 * ```
 * @param firstParser Parse the first element
 * @param secondParser Parse the second element
 */
export const pair = <T, U>(
  firstParser: Parser<T>,
  secondParser: Parser<U>
): Parser<[T, U]> =>
  firstParser.bind((first) => secondParser.map((second) => [first, second]));
