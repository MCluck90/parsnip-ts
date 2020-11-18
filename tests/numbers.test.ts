import { oneOrMore } from '../src/lib';
import { digit, integer, separatedInteger } from '../src/numbers';
import { assertSuccessfulParse, assertUnsuccessfulParse } from './util';

describe('digit', () => {
  test('matches any digit', () => {
    const result = oneOrMore(digit).parseStringToCompletion('0123456789');
    assertSuccessfulParse(result);
    expect(result).toEqual('0123456789'.split(''));
  });
});

describe('integer', () => {
  test('matches a zero', () => {
    const result = integer.parseStringToCompletion('0');
    assertSuccessfulParse(result);
    expect(result).toBe(0);
  });

  test('does not match numbers starting with a zero', () => {
    const result = integer.parseStringToCompletion('0123');
    assertUnsuccessfulParse(result);
  });

  test('matches numbers other than zero', () => {
    const result = integer.parseStringToCompletion('1234567890');
    assertSuccessfulParse(result);
    expect(result).toBe(1234567890);
  });
});

describe('separatedInteger', () => {
  test('allow underscore separators', () => {
    const result = separatedInteger.parseStringToCompletion('1_234_567_890');
    assertSuccessfulParse(result);
    expect(result).toBe(1234567890);
  });
});
