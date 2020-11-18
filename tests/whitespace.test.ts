import { whitespace, ws } from '../src/whitespace';
import { assertSuccessfulParse, assertUnsuccessfulParse } from './util';

describe('whitespace', () => {
  test('matches whitespace', () => {
    const input = ' \r\n\t';
    const result = whitespace.parseStringToCompletion(input);
    assertSuccessfulParse(result);
    expect(result).toBe(input);
  });

  test('requires at least one whitespace character', () => {
    const input = '';
    const result = whitespace.parseStringToCompletion(input);
    assertUnsuccessfulParse(result);
  });
});

describe('ws', () => {
  test('matches whitespace', () => {
    const input = ' \r\n\t';
    const result = ws.parseStringToCompletion(input);
    assertSuccessfulParse(result);
    expect(result).toBe(input);
  });

  test('matches zero or more whitespace', () => {
    const input = '';
    const result = ws.parseStringToCompletion(input);
    assertSuccessfulParse(result);
  });
});
