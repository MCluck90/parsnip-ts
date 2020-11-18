import { oneOrMore } from '../src/lib';
import {
  digit,
  exponent,
  floatingPoint,
  fraction,
  integer,
  separatedFloatingPoint,
  separatedInteger,
  sign,
} from '../src/numbers';
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

describe('sign', () => {
  test('matches a negative sign', () => {
    const result = sign.parseStringToCompletion('-');
    assertSuccessfulParse(result);
    expect(result).toBe('-');
  });

  test('matches a positive sign', () => {
    const result = sign.parseStringToCompletion('+');
    assertSuccessfulParse(result);
    expect(result).toBe('+');
  });
});

describe('exponent', () => {
  test('matches a simple lowercase exponent', () => {
    const result = exponent.parseStringToCompletion('e10');
    assertSuccessfulParse(result);
  });

  test('matches a simple uppercase exponent', () => {
    const result = exponent.parseStringToCompletion('E10');
    assertSuccessfulParse(result);
  });

  test('matches a signed exponent', () => {
    assertSuccessfulParse(exponent.parseStringToCompletion('e-10'));
    assertSuccessfulParse(exponent.parseStringToCompletion('e+10'));
  });
});

describe('fraction', () => {
  test('matches a single dot', () => {
    assertSuccessfulParse(fraction.parseStringToCompletion('.'));
  });

  test('matches a dot followed by digits', () => {
    assertSuccessfulParse(fraction.parseStringToCompletion('.12345678790'));
  });
});

describe('floatingPoint', () => {
  test('matches a simple floating point', () => {
    const result = floatingPoint.parseStringToCompletion('1.');
    assertSuccessfulParse(result);
    expect(result).toBe(1);
  });

  test('matches a floating point', () => {
    const result = floatingPoint.parseStringToCompletion('1.2345');
    assertSuccessfulParse(result);
    expect(result).toBe(1.2345);
  });

  test('matches a floating point with an exponent', () => {
    const result = floatingPoint.parseStringToCompletion('1.2345e6');
    assertSuccessfulParse(result);
    expect(result).toBe(1.2345e6);
  });
});

describe('separatedFloatingPoint', () => {
  test('matches a simple floating point', () => {
    const result = separatedFloatingPoint.parseStringToCompletion('1.');
    assertSuccessfulParse(result);
    expect(result).toBe(1);
  });

  test('matches a floating point', () => {
    const result = separatedFloatingPoint.parseStringToCompletion('1.2345');
    assertSuccessfulParse(result);
    expect(result).toBe(1.2345);
  });

  test('matches a floating point with an exponent', () => {
    const result = separatedFloatingPoint.parseStringToCompletion('1.2345e6');
    assertSuccessfulParse(result);
    expect(result).toBe(1.2345e6);
  });

  test('allows underscores in the integer', () => {
    const result = separatedFloatingPoint.parseStringToCompletion('1_000.2e3');
    assertSuccessfulParse(result);
    expect(result).toBe(1000.2e3);
  });
});
