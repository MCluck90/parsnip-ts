import { doubleQuoteString, singleQuoteString } from '../src/strings';
import { assertSuccessfulParse } from './util';

describe('singleQuoteString', () => {
  test('match an empty string', () => {
    const result = singleQuoteString.parseToEnd("''");
    assertSuccessfulParse(result);
    expect(result).toBe('');
  });

  test('match a simple single quote string', () => {
    const result = singleQuoteString.parseToEnd("'abc'");
    assertSuccessfulParse(result);
    expect(result).toBe('abc');
  });

  test('match a string with an escape sequence', () => {
    const result = singleQuoteString.parseToEnd("'\\n'");
    assertSuccessfulParse(result);
    expect(result).toBe('\n');
  });

  test('match a string with an escaped quote', () => {
    const result = singleQuoteString.parseToEnd("'\\''");
    assertSuccessfulParse(result);
    expect(result).toBe("'");
  });
});

describe('doubleQuoteString', () => {
  test('match an empty string', () => {
    const result = doubleQuoteString.parseToEnd('""');
    assertSuccessfulParse(result);
    expect(result).toBe('');
  });

  test('match a simple double quote string', () => {
    const result = doubleQuoteString.parseToEnd('"abc"');
    assertSuccessfulParse(result);
    expect(result).toBe('abc');
  });

  test('match a string with an escape sequence', () => {
    const result = doubleQuoteString.parseToEnd('"\\n"');
    assertSuccessfulParse(result);
    expect(result).toBe('\n');
  });

  test('match a string with an escaped quote', () => {
    const result = doubleQuoteString.parseToEnd('"\\""');
    assertSuccessfulParse(result);
    expect(result).toBe('"');
  });
});
