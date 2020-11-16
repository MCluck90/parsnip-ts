import { AssertionError } from 'assert';
import { ParseError } from './error';

export class Source {
  constructor(
    public source: string,
    public index: number,
    public line: number = 1,
    public column: number = 1
  ) {}

  private getNewLineAndColumn(value: string) {
    let line = this.line;
    let column = this.column + value.length;
    const lines = this.source.slice(this.index, value.length).match(/\n.*/g);
    if (lines) {
      line += lines.length;
      column = lines[lines.length - 1].length;
    }
    return { line, column };
  }

  getRemaining() {
    return this.source.slice(this.index);
  }

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
      regexp.toString(),
      this.source.slice(this.index, 10)
    );
  }

  text(text: string, message?: string): ParseResult<string> | ParseError {
    if (this.source.slice(this.index, text.length) === text) {
      const newIndex = this.index + text.length;
      const { line, column } = this.getNewLineAndColumn(text);
      const source = new Source(this.source, newIndex, line, column);
      return new ParseResult(text, source, line, column);
    }

    return new ParseError(
      this.line,
      this.column,
      message,
      text,
      this.source.slice(this.index, text.length)
    );
  }
}

export class ParseResult<T> {
  constructor(
    public value: T,
    public source: Source,
    public line: number,
    public column: number
  ) {}
}
