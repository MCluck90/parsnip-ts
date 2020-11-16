import { AssertionError } from 'assert';

export class Source {
  constructor(
    public source: string,
    public index: number,
    public line: number = 1,
    public column: number = 1
  ) {}

  match(regexp: RegExp): ParseResult<string> | null {
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
      let line = this.line;
      let column = this.column + value.length;
      const lines = this.source.slice(this.index, value.length).match(/\n.*/g);
      if (lines) {
        line += lines.length;
        column = lines[lines.length - 1].length;
      }
      const source = new Source(this.source, newIndex, line, column);
      return new ParseResult(value, source, line, column);
    }
    return null;
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
