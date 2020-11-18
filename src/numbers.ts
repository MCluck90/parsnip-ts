import { regexp } from './parser';

export const digit = regexp(/[0-9]/y);

export const integer = regexp(/0|[1-9][0-9]+/y).map(Number);

export const separatedInteger = regexp(/0|[1-9][0-9_]+/y).map((d) =>
  Number(d.replace(/_/g, ''))
);
