import { ParseError } from '../src/error';
import { Source } from '../src/lib';
import {
  constant,
  error,
  maybe,
  oneOrMore,
  Parser,
  regexp,
  zeroOrMore,
} from '../src/parser';
import { multiline } from '../src/util/string';

test('`constant` should return a constant value', () => {
  const result = constant(true).parse(new Source('', 0));
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }
  expect(result.value).toBe(true);
});

test('`error` should return an error', () => {
  const result = error('Error message').parse(new Source('', 0));
  expect(result).toBeInstanceOf(ParseError);
});

test('`maybe` should return null if a pattern does not match', () => {
  const result = maybe(new Parser((source) => source.match(/a/y))).parse(
    new Source('', 0)
  );
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }

  expect(result.value).toBe(null);
});

test('`maybe` should return the result if a pattern does match', () => {
  const result = maybe(new Parser((source) => source.match(/a/y))).parse(
    new Source('abc', 0)
  );
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }

  expect(result.value).toBe('a');
});

test('`regexp` matches a regular expression', () => {
  const result = regexp(/a/y).parse(new Source('abc', 0));
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }

  expect(result.value).toBe('a');
});

test('`regexp` should return ParseError if a regular expression does not match', () => {
  const result = regexp(/a/y).parse(new Source('z', 0));
  expect(result).toBeInstanceOf(ParseError);
});

test('`regexp` should allow specifying error information if a match does not occur', () => {
  const errorMessage = 'Should have had an "a"';
  const result = regexp(/a/y, errorMessage).parse(new Source('b', 0));
  if (!(result instanceof ParseError)) {
    expect(result).toBeInstanceOf(ParseError);
    return;
  }
  expect(result.message).toContain(errorMessage);
});

test('`zeroOrMore` should return an empty array when no matches are found', () => {
  const result = zeroOrMore(regexp(/a/y)).parse(new Source('z', 0));
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }

  expect(result.value).toHaveLength(0);
});

test('`zeroOrMore` should return an array containing all instances that match', () => {
  const result = zeroOrMore(regexp(/a/y)).parse(new Source('aaab', 0));
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }

  expect(result.value).toEqual(['a', 'a', 'a']);
});

test('`oneOrMore` should return ParseError when no matches are found', () => {
  const result = oneOrMore(regexp(/a/y)).parse(new Source('z', 0));
  expect(result).toBeInstanceOf(ParseError);
});

test('`oneOrMore` should allow the user to specify an error message', () => {
  const errorMessage = 'Should have had one or more "a"s';
  const result = oneOrMore(regexp(/a/y), errorMessage).parse(
    new Source('z', 0)
  );
  if (!(result instanceof ParseError)) {
    expect(result).toBeInstanceOf(ParseError);
    return;
  }
  expect(result.message).toContain(errorMessage);
});

test('`oneOrMore` should return an array when there is exactly one match', () => {
  const result = oneOrMore(regexp(/a/y)).parse(new Source('a', 0));
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }

  expect(result.value).toEqual(['a']);
});

test('`oneOrMore` should return an array containing all instances that match', () => {
  const result = oneOrMore(regexp(/a/y)).parse(new Source('aaab', 0));
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }

  expect(result.value).toEqual(['a', 'a', 'a']);
});

test('`and` should chain together two parsers', () => {
  const aParser = regexp(/a/y);
  const bParser = regexp(/b/y);
  const combined = aParser.and(bParser);
  const result = combined.parse(new Source('ab', 0));
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }

  expect(result.value).toBe('b');
});

test('`bind` should allow binding another parser after another', () => {
  const parser = regexp(/a/y).bind((a) => constant(`${a}bc`));
  const result = parser.parse(new Source('a', 0));
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }

  expect(result.value).toBe('abc');
});

test('`map` should allow mapping the result to some other value', () => {
  const parser = regexp(/a+/y).map((listOfAs) => listOfAs.length);
  const result = parser.parse(new Source('aaaaa', 0));
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }

  expect(result.value).toBe(5);
});

test('`or` should return the value of the first parser if it matches', () => {
  const parser = regexp(/a/y).or(regexp(/1/y).map(() => 1));
  const result = parser.parse(new Source('a', 0));
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }

  expect(result.value).toBe('a');
});

test('`or` should return the value of the second parser if the first does not matche', () => {
  const parser = regexp(/a/y).or(regexp(/1/y).map(() => 1));
  const result = parser.parse(new Source('1', 0));
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }

  expect(result.value).toBe(1);
});

test('`parseStringToCompletion` should return an error if parsing fails', () => {
  const result = regexp(/a/y).parseStringToCompletion('b');
  expect(result).toBeInstanceOf(ParseError);
});

test('`parseStringToCompletion` should return an error if parsing does not complete', () => {
  const result = regexp(/a/y).parseStringToCompletion('aa');
  expect(result).toBeInstanceOf(ParseError);
});

test('`parseStringToCompletion` should return the result if parsing is successful', () => {
  const result = regexp(/a+/y).parseStringToCompletion('aaa');
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }

  expect(result).toBe('aaa');
});

test('`parseStringToCompletion` should return line where error occurred', () => {
  const input = multiline`
    line1
    line2
    line3
  `;
  const line1Parser = regexp(/line1\n/y);
  const parser = line1Parser.and(line1Parser);
  const result = parser.parseStringToCompletion(input);
  if (!(result instanceof ParseError)) {
    expect(result).toBeInstanceOf(ParseError);
    return;
  }
  expect(result.line).toBe(2);
});

test('`parseStringToCompletion` should return column where error occurred', () => {
  const input = 'abc';
  const parser = regexp(/a/y).and(regexp(/c/y));
  const result = parser.parseStringToCompletion(input);
  if (!(result instanceof ParseError)) {
    expect(result).toBeInstanceOf(ParseError);
    return;
  }
  expect(result.column).toBe(2);
});
