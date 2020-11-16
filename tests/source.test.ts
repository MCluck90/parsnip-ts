import { AssertionError } from 'assert';
import { Source } from '../src/lib';
import { multiline } from '../src/util/string';

test('Regular expression must be sticky', () => {
  const source = new Source('a', 0);
  expect(() => source.match(/a/)).toThrowError(AssertionError);
  expect(() => source.match(/a/y)).not.toThrowError();
});

test('Returns null if there is not a match', () => {
  const source = new Source('a', 0);
  const result = source.match(/b/y);
  expect(result).toBe(null);
});

test('Can match a simple string', () => {
  const source = new Source('a', 0);
  const result = source.match(/a/y);
  expect(result).not.toBe(null);
});

test('Updates column', () => {
  let sourceString = 'a';
  let source = new Source(sourceString, 0);
  let result = source.match(/a/y);
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }
  expect(result.column).toBe(sourceString.length + 1);

  sourceString = 'abcdefghijkl';
  source = new Source(sourceString, 0);
  result = source.match(/abcdefghijkl/y);
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }

  expect(result.column).toBe(sourceString.length + 1);
});

test('Updates line', () => {
  const sourceString = multiline`
    line1
    line2
    line3
  `;
  const source = new Source(sourceString, 0);
  let result = source.match(/line1/y);
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }
  expect(result.line).toBe(1);

  result = source.match(/line1\n/y);
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }
  expect(result.line).toBe(2);

  result = source.match(/line1\nline2\n/y);
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }
  expect(result.line).toBe(3);
});

test('Updates column after a line break', () => {
  const sourceString = multiline`
    line1
    line2
  `;
  const source = new Source(sourceString, 0);
  const result = source.match(/line1\nline2/y);
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }
  expect(result.column).toBe('line2'.length + 1);
});

test('Column should include relevant whitespace', () => {
  const sourceString = multiline`
    line1
      line2
  `;
  const source = new Source(sourceString, 0);
  const result = source.match(/line1\n  line2/y);
  if (result === null) {
    expect(result).not.toBe(null);
    return;
  }
  expect(result.column).toBe('  line2'.length + 1);
});
