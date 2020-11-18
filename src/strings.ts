import { escapeSequence } from './escape-sequences';
import { regexp, text } from './parser';

const string = (delimiter: string) =>
  text(delimiter)
    .and(
      escapeSequence.or(
        regexp(new RegExp(`(?:[^${delimiter}\\\\]|\\\\.)*`, 'y'))
      )
    )
    .bind((str) => text(delimiter).map(() => str));

export const singleQuoteString = string("'");

export const doubleQuoteString = string('"');
