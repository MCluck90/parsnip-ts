export class ParseError extends Error {
  public line: number;
  public column: number;
  constructor(
    line: number,
    column: number,
    message = 'Parse error',
    expected?: string,
    actual?: string
  ) {
    let errorMessage = `${message} [${line}:${column}]`;
    if (expected !== undefined && actual !== undefined) {
      errorMessage += `\nExpected: ${expected}\nActual: ${actual}`;
    }
    super(errorMessage);

    this.line = line;
    this.column = column;
  }
}
