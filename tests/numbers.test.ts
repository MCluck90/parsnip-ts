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
  signedFloatingPoint,
  signedInteger,
  signedSeparatedFloatingPoint,
  signedSeparatedInteger,
} from '../src/numbers';
import { assertSuccessfulParse, assertUnsuccessfulParse } from './util';

describe('sign', () => {
  test('matches a negative sign', () => {
    const result = sign.parseToEnd('-');
    assertSuccessfulParse(result);
    expect(result).toBe('-');
  });

  test('matches a positive sign', () => {
    const result = sign.parseToEnd('+');
    assertSuccessfulParse(result);
    expect(result).toBe('+');
  });
});

describe('digit', () => {
  test('matches any digit', () => {
    const result = oneOrMore(digit).parseToEnd('0123456789');
    assertSuccessfulParse(result);
    expect(result).toEqual('0123456789'.split(''));
  });
});

describe('integer', () => {
  test('matches a zero', () => {
    const result = integer.parseToEnd('0');
    assertSuccessfulParse(result);
    expect(result).toBe(0);
  });

  test('does not match numbers starting with a zero', () => {
    const result = integer.parseToEnd('0123');
    assertUnsuccessfulParse(result);
  });

  test('matches numbers other than zero', () => {
    const result = integer.parseToEnd('1234567890');
    assertSuccessfulParse(result);
    expect(result).toBe(1234567890);
  });
});

describe('signedInteger', () => {
  test('matches a negative integer', () => {
    const result = signedInteger.parseToEnd('-123');
    assertSuccessfulParse(result);
    expect(result).toBe(-123);
  });

  test('matches a positive integer', () => {
    const result = signedInteger.parseToEnd('+123');
    assertSuccessfulParse(result);
    expect(result).toBe(123);
  });

  test('matches an integer without a sign', () => {
    const result = signedInteger.parseToEnd('123');
    assertSuccessfulParse(result);
    expect(result).toBe(123);
  });
});

describe('separatedInteger', () => {
  test('allow underscore separators', () => {
    const result = separatedInteger.parseToEnd('1_234_567_890');
    assertSuccessfulParse(result);
    expect(result).toBe(1234567890);
  });
});

describe('signedSeparatedInteger', () => {
  test('matches a negative integer', () => {
    const result = signedSeparatedInteger.parseToEnd('-1_234');
    assertSuccessfulParse(result);
    expect(result).toBe(-1234);
  });

  test('matches a positive integer', () => {
    const result = signedSeparatedInteger.parseToEnd('+1_234');
    assertSuccessfulParse(result);
    expect(result).toBe(1234);
  });

  test('matches an integer without a sign', () => {
    const result = signedSeparatedInteger.parseToEnd('1_234');
    assertSuccessfulParse(result);
    expect(result).toBe(1234);
  });
});

describe('exponent', () => {
  test('matches a simple lowercase exponent', () => {
    const result = exponent.parseToEnd('e10');
    assertSuccessfulParse(result);
  });

  test('matches a simple uppercase exponent', () => {
    const result = exponent.parseToEnd('E10');
    assertSuccessfulParse(result);
  });

  test('matches a signed exponent', () => {
    assertSuccessfulParse(exponent.parseToEnd('e-10'));
    assertSuccessfulParse(exponent.parseToEnd('e+10'));
  });
});

describe('fraction', () => {
  test('matches a single dot', () => {
    assertSuccessfulParse(fraction.parseToEnd('.'));
  });

  test('matches a dot followed by digits', () => {
    assertSuccessfulParse(fraction.parseToEnd('.12345678790'));
  });
});

describe('floatingPoint', () => {
  test('matches a simple floating point', () => {
    const result = floatingPoint.parseToEnd('1.');
    assertSuccessfulParse(result);
    expect(result).toBe(1);
  });

  test('matches a floating point', () => {
    const result = floatingPoint.parseToEnd('1.2345');
    assertSuccessfulParse(result);
    expect(result).toBe(1.2345);
  });

  test('matches a floating point with an exponent', () => {
    const result = floatingPoint.parseToEnd('1.2345e6');
    assertSuccessfulParse(result);
    expect(result).toBe(1.2345e6);
  });
});

describe('signedFloatingPoint', () => {
  test('matches a positive floating point', () => {
    const result = signedFloatingPoint.parseToEnd('+1.23e45');
    assertSuccessfulParse(result);
    expect(result).toBe(1.23e45);
  });

  test('matches a negative floating point', () => {
    const result = signedFloatingPoint.parseToEnd('-1.23e45');
    assertSuccessfulParse(result);
    expect(result).toBe(-1.23e45);
  });

  test('matches a floating point without a sign', () => {
    const result = signedFloatingPoint.parseToEnd('1.23e45');
    assertSuccessfulParse(result);
    expect(result).toBe(1.23e45);
  });
});

describe('separatedFloatingPoint', () => {
  test('matches a simple floating point', () => {
    const result = separatedFloatingPoint.parseToEnd('1.');
    assertSuccessfulParse(result);
    expect(result).toBe(1);
  });

  test('matches a floating point', () => {
    const result = separatedFloatingPoint.parseToEnd('1.2345');
    assertSuccessfulParse(result);
    expect(result).toBe(1.2345);
  });

  test('matches a floating point with an exponent', () => {
    const result = separatedFloatingPoint.parseToEnd('1.2345e6');
    assertSuccessfulParse(result);
    expect(result).toBe(1.2345e6);
  });

  test('allows underscores in the integer', () => {
    const result = separatedFloatingPoint.parseToEnd('1_000.2e3');
    assertSuccessfulParse(result);
    expect(result).toBe(1000.2e3);
  });
});

describe('signedSeparatedFloatingPoint', () => {
  test('matches a positive floating point', () => {
    const result = signedSeparatedFloatingPoint.parseToEnd('+1_0.23e45');
    assertSuccessfulParse(result);
    expect(result).toBe(10.23e45);
  });

  test('matches a negative floating point', () => {
    const result = signedSeparatedFloatingPoint.parseToEnd('-1_0.23e45');
    assertSuccessfulParse(result);
    expect(result).toBe(-10.23e45);
  });

  test('matches a floating point without a sign', () => {
    const result = signedSeparatedFloatingPoint.parseToEnd('1_0.23e45');
    assertSuccessfulParse(result);
    expect(result).toBe(10.23e45);
  });
});
