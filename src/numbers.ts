import { maybeWithDefault, regexp, text } from './parser';

/**
 * Parse a numerical sign
 *
 * ```ts
 * sign.parseToEnd('+') // '+'
 * ```
 */
export const sign = regexp(/[+-]/y, '+ or -');

/**
 * Parse a single digit
 *
 * ```ts
 * digit.matches('1') // true
 * ```
 */
export const digit = regexp(/\d/y, 'a digit');

/**
 * Parse an integer
 *
 * ```ts
 * integer.parseToEnd('123') // 123
 * ```
 */
export const integer = regexp(/0|[1-9][0-9]*/y, 'an integer').map(Number);

/**
 * Parse an integer, optionally preceded with a sign
 *
 * ```ts
 * signedInteger.parseToEnd('-123') // -123
 * ```
 */
export const signedInteger = maybeWithDefault(sign, '')
  .concat(integer)
  .map(Number);

/**
 * Parse an integer which may be separated with underscores
 *
 * ```ts
 * separatedInteger.parseToEnd('1_000') // 1000
 * ```
 */
export const separatedInteger = regexp(/0|[1-9][0-9_]*/y).map((d) =>
  Number(d.replace(/_/g, ''))
);

/**
 * Parse an integer with an optional sign and separators
 *
 * ```ts
 * signedSeparatedInteger.parseToEnd('-1_000') // -1000
 * ```
 */
export const signedSeparatedInteger = maybeWithDefault(sign, '')
  .concat(separatedInteger)
  .map((d) => Number(d.replace(/_/g, '')));

/**
 * Parse an exponent
 *
 * ```ts
 * exponent.matches('e123') // true
 * ```
 */
export const exponent = regexp(/[eE]/y)
  .concat(maybeWithDefault(sign, ''))
  .concat(regexp(/\d+/y));

/**
 * Parse a fraction
 *
 * ```ts
 * fraction.matches('.123') // true
 * ```
 */
export const fraction = text('.').concat(maybeWithDefault(regexp(/\d+/y), ''));

/**
 * Parse a floating point number
 *
 * ```ts
 * floatingPoint.parseToEnd('1.2e3') // 1200
 * ```
 */
export const floatingPoint = integer
  .concat(fraction)
  .concat(maybeWithDefault(exponent, ''))
  .map(Number);

/**
 * Parse a floating point number with an optional sign
 *
 * ```ts
 * signedFloatingPoint.parseToEnd('-1.2e3') // -1200
 * ```
 */
export const signedFloatingPoint = maybeWithDefault(sign, '')
  .concat(floatingPoint)
  .map(Number);

/**
 * Parse a floating point number with optional separators
 *
 * ```ts
 * separatedFloatingPoint.parseToEnd('1_000.2e3') // 1000200
 * ```
 */
export const separatedFloatingPoint = separatedInteger
  .concat(fraction)
  .concat(maybeWithDefault(exponent, ''))
  .map(Number);

/**
 * Parse a floating point number with optional sign and separators
 *
 * ```ts
 * signedSeparatedFloatingPoint.parseToEnd('-1_000.2e3') // -1000200
 * ```
 */
export const signedSeparatedFloatingPoint = maybeWithDefault(sign, '')
  .concat(separatedFloatingPoint)
  .map(Number);
