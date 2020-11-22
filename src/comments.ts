import { regexp, text } from './parser';
import { escapeRegExp } from './util/string';

/**
 * Define your own line comment.
 *
 * ```ts
 * const bashLineComment = lineComment('#')
 * ```
 *
 * @param delimiter Delimiter to start a line comment
 */
export const lineComment = (delimiter: string) =>
  text(delimiter).concat(regexp(/[^\r\n]*/y));

/**
 * Define your own block comment.
 *
 * ```ts
 * const fSharpBlockComment = blockComment('(*', '*)')
 * ```
 *
 * @param start Start of block comment
 * @param end End of block comment
 */
export const blockComment = (start: string, end: string) =>
  text(start).concat(regexp(new RegExp(`.*${escapeRegExp(end)}`, 'sy')));

/**
 * C-style line comment
 *
 * ```ts
 * cStyleLineComment.matches('// some comment') // true
 * ```
 */
export const cStyleLineComment = lineComment('//');

/**
 * C-style block comment
 */
export const cStyleBlockComment = blockComment('/*', '*/');

/**
 * C-style comment (line and block)
 */
export const cStyleComment = cStyleLineComment.or(cStyleBlockComment);
