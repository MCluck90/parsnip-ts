import { escapeSequence } from '../src/escape-sequences';
import { oneOrMore } from '../src/parser';
import { assertSuccessfulParse } from './util';

describe('escapeSequence', () => {
  test('matches a series of escape sequences', () => {
    const input = '\\b\\f\\n\\r\\t\\v\\0\\\'\\"\\\\';
    const result = oneOrMore(escapeSequence).parseToEnd(input);
    assertSuccessfulParse(result);
    expect(result.join('')).toBe('\b\f\n\r\t\v\0\'"\\');
  });
});
