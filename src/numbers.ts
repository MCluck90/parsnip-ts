import { maybeWithDefault, regexp, text } from './parser';

export const sign = regexp(/[+-]/y, '+ or -');

export const digit = regexp(/\d/y, 'a digit');

export const integer = regexp(/0|[1-9][0-9]*/y, 'an integer').map(Number);

export const signedInteger = maybeWithDefault(sign, '')
  .concat(integer)
  .map(Number);

export const separatedInteger = regexp(/0|[1-9][0-9_]*/y).map((d) =>
  Number(d.replace(/_/g, ''))
);

export const signedSeparatedInteger = maybeWithDefault(sign, '')
  .concat(separatedInteger)
  .map((d) => Number(d.replace(/_/g, '')));

export const exponent = regexp(/[eE]/y)
  .concat(maybeWithDefault(sign, ''))
  .concat(regexp(/\d+/y));

export const fraction = text('.').concat(maybeWithDefault(regexp(/\d+/y), ''));

export const floatingPoint = integer
  .concat(fraction)
  .concat(maybeWithDefault(exponent, ''))
  .map(Number);

export const signedFloatingPoint = maybeWithDefault(sign, '')
  .concat(floatingPoint)
  .map(Number);

export const separatedFloatingPoint = separatedInteger
  .concat(fraction)
  .concat(maybeWithDefault(exponent, ''))
  .map(Number);

export const signedSeparatedFloatingPoint = maybeWithDefault(sign, '')
  .concat(separatedFloatingPoint)
  .map(Number);
