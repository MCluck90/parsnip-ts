import { regexp, text } from './parser';
import { escapeRegExp } from './util/string';

export const lineComment = (delimiter: string) =>
  text(delimiter).concat(regexp(/[^\r\n]*/y));

export const blockComment = (start: string, end: string) =>
  text(start).concat(regexp(new RegExp(`.*${escapeRegExp(end)}`, 'sy')));

export const cStyleLineComment = lineComment('//');
export const cStyleBlockComment = blockComment('/*', '*/');
export const cStyleComment = cStyleLineComment.or(cStyleBlockComment);
