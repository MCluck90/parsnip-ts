import { regexp } from './parser';

export const boolean = regexp(/true\b|false\b/y).map((bool) =>
  bool === 'true' ? true : false
);
