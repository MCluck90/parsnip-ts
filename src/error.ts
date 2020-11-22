import { Source } from './source';
import { multiline } from './util/string';

/**
 * Error returned when a parser fails
 */
export class ParseError extends Error {
  /** Line that the error occurred on */
  public line: number;
  /** Column that the error occurred on */
  public column: number;

  /**
   *
   * @param line Line that the error occurred on
   * @param column Column that the error occurred on
   * @param message Message describing error
   * @param source Source of the error
   * @param expected What was expected
   * @param actual What was found
   */
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
