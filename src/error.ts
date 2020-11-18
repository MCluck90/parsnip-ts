import { Source } from './source';
import { multiline } from './util/string';

export class ParseError extends Error {
  public line: number;
  public column: number;
  constructor(
    line: number,
    column: number,
    message = 'Parse error',
    source: Source,
    expected?: string,
    actual?: string
  ) {
    let errorMessage = `${message} [${line}:${column}]`;
    if (expected !== undefined && actual !== undefined) {
      errorMessage += `\nExpected: ${expected}\nActual: ${actual}\n`;
    }
    errorMessage += multiline`
      ${source.source.split('\n')[line - 1]}
      ${' '.repeat(column - 1)}^
      `;
    super(errorMessage);

    this.line = line;
    this.column = column;
  }
}
