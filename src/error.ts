import { multiline } from './util/string';

export class ParseError extends Error {
  public line: number;
  public column: number;
  constructor(message: string, line: number, column: number) {
    const errorMessage = `
      Error at ${line}:${column}
      ${message}
    `;
    super(errorMessage);

    this.line = line;
    this.column = column;
  }
}
