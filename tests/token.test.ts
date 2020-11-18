import { createToken } from '../src/token';
import { whitespace } from '../src/whitespace';
import { assertSuccessfulParse } from './util';

describe('token', () => {
  test('will ignore whatever you tell it to', () => {
    const token = createToken(whitespace);
    const nullParser = token(/null/y);
    const result = nullParser.parseStringToCompletion(' \r\n\tnull\t\n\r ');
    assertSuccessfulParse(result);
    expect(result).toBe('null');
  });
});
