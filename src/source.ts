import { AssertionError } from 'assert';
import { ParseError } from './error';

export class Source {
  /**
   * Source for parsing
   * @param source Source input
   * @param index Where in the input to begin parsing
   * @param line Line which `source[index]` is on
   * @param column Column which `source[index]` is on
   */
  constructor(
    public source: string,
    public index: number,
    public line: number = 1,
    public column: number = 1
  ) {}

  private getNewLineAndColumn(value: string) {
    let line = this.line;
    let column = this.column + value.length;
    const lines = this.source.substr(this.index, value.length).match(/\n.*/g);
    if (lines) {
      line += lines.length;
      column = lines[lines.length - 1].length;
    }
    return { line, column };
  }

  /**
   * Get the remaining input
   */
  getRemaining() {
    return this.source.substr(this.index);
  }

  /**
   * Attempt to match the source against a regular expression
   * @param regexp Regular expression to match
   * @param message Error message if it fails
   */
  match(regexp: RegExp, message?: string): ParseResult<string> | ParseError {
    if (!regexp.sticky) {
      throw new AssertionError({
        message:
          'Regular expressions must be sticky. Add the `y` flag to your expression',
        expected: `${regexp.toString()}y`,
        actual: regexp.toString(),
      });
    }

    regexp.lastIndex = this.index;
    const match = this.source.match(regexp);
    if (match) {
      const value = match[0];
      const newIndex = this.index + value.length;
      const { line, column } = this.getNewLineAndColumn(value);
      const source = new Source(this.source, newIndex, line, column);
      return new ParseResult(value, source, line, column);
    }

    return new ParseError(
      this.line,
      this.column,
      message,
      this,
      regexp.toString(),
      this.source.substr(this.index, 10)
    );
  }

  /**
   * Attempt to match the source against a literal string
   * @param text Text to match
   * @param message Error message, if it fails
   */
  text(text: string, message?: string): ParseResult<string> | ParseError {
    if (this.source.substr(this.index, text.length) === text) {
      const newIndex = this.index + text.length;
      const { line, column } = this.getNewLineAndColumn(text);
      const source = new Source(this.source, newIndex, line, column);
      return new ParseResult(text, source, line, column);
    }

    return new ParseError(
      this.line,
      this.column,
      message,
      this,
      text,
      this.source.substr(this.index, text.length)
    );
  }
}

export class ParseResult<T> {
  /**
   * Result of parsing
   * @param value Value from parsing
   * @param source Source that value was parsed from
   * @param line Line at the end of the result
   * @param column Column at the end of the result
   */
  constructor(
    public value: T,
    public source: Source,
    public line: number,
    public column: number
  ) {}
}
