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

test('`constant` should return a constant value', () => {
  const result = constant(true).parse(new Source('', 0));
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }
  expect(result.value).toBe(true);
});

test('`error` should throw an error', () => {
  expect(() => error('Error message').parse(new Source('', 0))).toThrowError(
    ParseError
  );
});

test('`maybe` should return null if a pattern does not match', () => {
  const result = maybe(new Parser((source) => source.match(/a/y))).parse(
    new Source('', 0)
  );
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }

  expect(result.value).toBe(null);
});

test('`maybe` should return the result if a pattern does match', () => {
  const result = maybe(new Parser((source) => source.match(/a/y))).parse(
    new Source('abc', 0)
  );
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }

  expect(result.value).toBe('a');
});

test('`regexp` matches a regular expression', () => {
  const result = regexp(/a/y).parse(new Source('abc', 0));
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }

  expect(result.value).toBe('a');
});

test('`regexp` should return null if a regular expression does not match', () => {
  const result = regexp(/a/y).parse(new Source('z', 0));
  expect(result).toBe(null);
});

test('`zeroOrMore` should return an empty array when no matches are found', () => {
  const result = zeroOrMore(regexp(/a/y)).parse(new Source('z', 0));
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }

  expect(result.value).toHaveLength(0);
});

test('`zeroOrMore` should return an array containing all instances that match', () => {
  const result = zeroOrMore(regexp(/a/y)).parse(new Source('aaab', 0));
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }

  expect(result.value).toEqual(['a', 'a', 'a']);
});

test('`oneOrMore` should return null when no matches are found', () => {
  const result = oneOrMore(regexp(/a/y)).parse(new Source('z', 0));
  expect(result).toBe(null);
});

test('`oneOrMore` should return an array when there is exactly one match', () => {
  const result = oneOrMore(regexp(/a/y)).parse(new Source('a', 0));
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }

  expect(result.value).toEqual(['a']);
});

test('`oneOrMore` should return an array containing all instances that match', () => {
  const result = oneOrMore(regexp(/a/y)).parse(new Source('aaab', 0));
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }

  expect(result.value).toEqual(['a', 'a', 'a']);
});

test('`and` should chain together two parsers', () => {
  const aParser = regexp(/a/y);
  const bParser = regexp(/b/y);
  const combined = aParser.and(bParser);
  const result = combined.parse(new Source('ab', 0));
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }

  expect(result.value).toBe('b');
});

test('`bind` should allow binding another parser after another', () => {
  const parser = regexp(/a/y).bind((a) => constant(`${a}bc`));
  const result = parser.parse(new Source('a', 0));
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }

  expect(result.value).toBe('abc');
});

test('`map` should allow mapping the result to some other value', () => {
  const parser = regexp(/a+/y).map((listOfAs) => listOfAs.length);
  const result = parser.parse(new Source('aaaaa', 0));
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }

  expect(result.value).toBe(5);
});

test('`or` should return the value of the first parser if it matches', () => {
  const parser = regexp(/a/y).or(regexp(/1/y).map(() => 1));
  const result = parser.parse(new Source('a', 0));
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }

  expect(result.value).toBe('a');
});

test('`or` should return the value of the second parser if the first does not matche', () => {
  const parser = regexp(/a/y).or(regexp(/1/y).map(() => 1));
  const result = parser.parse(new Source('1', 0));
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }

  expect(result.value).toBe(1);
});

test('`parseStringToCompletion` should throw an error if parsing fails', () => {
  expect(() => regexp(/a/y).parseStringToCompletion('b')).toThrowError(
    ParseError
  );
});

test('`parseStringToCompletion` should throw an error if parsing does not complete', () => {
  expect(() => regexp(/a/y).parseStringToCompletion('aa')).toThrowError(
    ParseError
  );
});
