import { boolean } from '../src/boolean';
import { assertSuccessfulParse } from './util';

describe('boolean', () => {
  test('matches true', () => {
    const result = boolean.parseToEnd('true');
    assertSuccessfulParse(result);
    expect(result).toBe(true);
  });

  test('matches false', () => {
    const result = boolean.parseToEnd('false');
    assertSuccessfulParse(result);
    expect(result).toBe(false);
  });
});
