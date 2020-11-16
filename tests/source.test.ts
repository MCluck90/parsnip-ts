import { AssertionError } from 'assert';
import { ParseError } from '../src/error';
import { Source } from '../src/source';
import { multiline } from '../src/util/string';

test('`match` requires a sticky regular expression', () => {
  const source = new Source('a', 0);
  expect(() => source.match(/a/)).toThrowError(AssertionError);
  expect(() => source.match(/a/y)).not.toThrowError();
});

test('`match` returns a ParseError if there is not a match', () => {
  const source = new Source('a', 0);
  const result = source.match(/b/y);
  expect(result).toBeInstanceOf(ParseError);
});

test('The ParseError returned by `match` should contain line and column', () => {
  const source = new Source('a', 0, 1, 2);
  const result = source.match(/b/y);
  if (!(result instanceof ParseError)) {
    expect(result).toBeInstanceOf(ParseError);
    return;
  }

  expect(result.line).toBe(1);
  expect(result.column).toBe(2);
});

test('Can match a simple string', () => {
  const source = new Source('a', 0);
  const result = source.match(/a/y);
  expect(result).not.toBe(null);
});

test('`match` returns an updated column', () => {
  let sourceString = 'a';
  let source = new Source(sourceString, 0);
  let result = source.match(/a/y);
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }
  expect(result.column).toBe(sourceString.length + 1);

  sourceString = 'abcdefghijkl';
  source = new Source(sourceString, 0);
  result = source.match(/abcdefghijkl/y);
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }

  expect(result.column).toBe(sourceString.length + 1);
});

test('`match` returns an updated line', () => {
  const sourceString = multiline`
    line1
    line2
    line3
  `;
  const source = new Source(sourceString, 0);
  let result = source.match(/line1/y);
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }
  expect(result.line).toBe(1);

  result = source.match(/line1\n/y);
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }
  expect(result.line).toBe(2);

  result = source.match(/line1\nline2\n/y);
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }
  expect(result.line).toBe(3);
});

test('`match` resets column after a line break', () => {
  const sourceString = multiline`
    line1
    line2
  `;
  const source = new Source(sourceString, 0);
  const result = source.match(/line1\nline2/y);
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }
  expect(result.column).toBe('line2'.length + 1);
});

test('`match` should include relevant whitespace when calculating column', () => {
  const sourceString = multiline`
    line1
      line2
  `;
  const source = new Source(sourceString, 0);
  const result = source.match(/line1\n {2}line2/y);
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }
  expect(result.column).toBe('  line2'.length + 1);
});

test('`text` should match a string', () => {
  const result = new Source('a', 0).text('a');
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }
  expect(result.value).toBe('a');
});

test('`text` should return an updated column', () => {
  const result = new Source('abcdef', 0).text('abcd');
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }

  expect(result.column).toBe(5);
});

test('`text` should return an updated line', () => {
  const result = new Source('a\nb', 0).text('a\nb');
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }

  expect(result.line).toBe(2);
});

test('`text` should reset column after a line break', () => {
  const result = new Source('abcd\n', 0).text('abcd\n');
  if (result instanceof ParseError) {
    expect(result).not.toBeInstanceOf(ParseError);
    return;
  }

  expect(result.line).toBe(2);
  expect(result.column).toBe(1);
});
