import { maybeWithDefault, regexp, text } from './parser';

export const digit = regexp(/\d/y);

export const integer = regexp(/0|[1-9][0-9]*/y).map(Number);

export const separatedInteger = regexp(/0|[1-9][0-9_]*/y).map((d) =>
  Number(d.replace(/_/g, ''))
);

export const sign = regexp(/[+-]/y);

export const exponent = regexp(/[eE]/y)
  .concat(maybeWithDefault(sign, ''))
  .concat(regexp(/\d+/y));

export const fraction = text('.').concat(maybeWithDefault(regexp(/\d+/y), ''));

export const floatingPoint = integer
  .concat(fraction)
  .concat(maybeWithDefault(exponent, ''))
  .map(Number);

export const separatedFloatingPoint = separatedInteger
  .concat(fraction)
  .concat(maybeWithDefault(exponent, ''))
  .map(Number);
