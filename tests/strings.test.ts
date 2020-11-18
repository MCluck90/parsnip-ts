import { doubleQuoteString, singleQuoteString } from '../src/strings';
import { assertSuccessfulParse } from './util';

describe('singleQuoteString', () => {
  test('match an empty string', () => {
    const result = singleQuoteString.parseStringToCompletion("''");
    assertSuccessfulParse(result);
    expect(result).toBe('');
  });

  test('match a simple single quote string', () => {
    const result = singleQuoteString.parseStringToCompletion("'abc'");
    assertSuccessfulParse(result);
    expect(result).toBe('abc');
  });

  test('match a string with an escape sequence', () => {
    const result = singleQuoteString.parseStringToCompletion("'\\n'");
    assertSuccessfulParse(result);
    expect(result).toBe('\n');
  });

  test('match a string with an escaped quote', () => {
    const result = singleQuoteString.parseStringToCompletion("'\\''");
    assertSuccessfulParse(result);
    expect(result).toBe("'");
  });
});

describe('doubleQuoteString', () => {
  test('match an empty string', () => {
    const result = doubleQuoteString.parseStringToCompletion('""');
    assertSuccessfulParse(result);
    expect(result).toBe('');
  });

  test('match a simple double quote string', () => {
    const result = doubleQuoteString.parseStringToCompletion('"abc"');
    assertSuccessfulParse(result);
    expect(result).toBe('abc');
  });

  test('match a string with an escape sequence', () => {
    const result = doubleQuoteString.parseStringToCompletion('"\\n"');
    assertSuccessfulParse(result);
    expect(result).toBe('\n');
  });

  test('match a string with an escaped quote', () => {
    const result = doubleQuoteString.parseStringToCompletion('"\\""');
    assertSuccessfulParse(result);
    expect(result).toBe('"');
  });
});
