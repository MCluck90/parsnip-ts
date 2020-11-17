import { ParseError } from '../src/error';
import { Source } from '../src/source';
import {
  boolean,
  comments,
  constant,
  error,
  escapeSequence,
  ignored,
  integer,
  maybe,
  not,
  oneOrMore,
  Parser,
  regexp,
  singleQuoteString,
  text,
  token,
  whitespace,
  zeroOrMore,
} from '../src/parser';
import { multiline } from '../src/util/string';

function assertSuccessfulParse<T>(result: ParseError | T): asserts result is T {
  if (result instanceof ParseError) {
    throw result;
  }
}

function assertUnsuccessfulParse<T>(
  result: T | ParseError
): asserts result is ParseError {
  if (!(result instanceof ParseError)) {
    expect(result).toBeInstanceOf(ParseError);
  }
}

describe('constant', () => {
  test('should return a constant value', () => {
    const result = constant(true).parse(new Source('', 0));
    assertSuccessfulParse(result);
    expect(result.value).toBe(true);
  });
});

describe('error', () => {
  test('should return an error', () => {
    const result = error('Error message').parse(new Source('', 0));
    expect(result).toBeInstanceOf(ParseError);
  });
});

describe('maybe', () => {
  test('should return null if a pattern does not match', () => {
    const result = maybe(new Parser((source) => source.match(/a/y))).parse(
      new Source('', 0)
    );
    assertSuccessfulParse(result);
    expect(result.value).toBe(null);
  });

  test('should return the result if a pattern does match', () => {
    const result = maybe(new Parser((source) => source.match(/a/y))).parse(
      new Source('abc', 0)
    );
    assertSuccessfulParse(result);
    expect(result.value).toBe('a');
  });
});

describe('regexp', () => {
  test('matches a regular expression', () => {
    const result = regexp(/a/y).parse(new Source('abc', 0));
    assertSuccessfulParse(result);
    expect(result.value).toBe('a');
  });

  test('should return ParseError if a regular expression does not match', () => {
    const result = regexp(/a/y).parse(new Source('z', 0));
    expect(result).toBeInstanceOf(ParseError);
  });

  test('should allow specifying error information if a match does not occur', () => {
    const errorMessage = 'Should have had an "a"';
    const result = regexp(/a/y, errorMessage).parse(new Source('b', 0));
    assertUnsuccessfulParse(result);
    expect(result.message).toContain(errorMessage);
  });
});

describe('zeroOrMore', () => {
  test('should return an empty array when no matches are found', () => {
    const result = zeroOrMore(regexp(/a/y)).parse(new Source('z', 0));
    assertSuccessfulParse(result);
    expect(result.value).toHaveLength(0);
  });

  test('should return an array containing all instances that match', () => {
    const result = zeroOrMore(regexp(/a/y)).parse(new Source('aaab', 0));
    assertSuccessfulParse(result);
    expect(result.value).toEqual(['a', 'a', 'a']);
  });
});

describe('oneOrMore', () => {
  test('should return ParseError when no matches are found', () => {
    const result = oneOrMore(regexp(/a/y)).parse(new Source('z', 0));
    expect(result).toBeInstanceOf(ParseError);
  });

  test('should allow the user to specify an error message', () => {
    const errorMessage = 'Should have had one or more "a"s';
    const result = oneOrMore(regexp(/a/y), errorMessage).parse(
      new Source('z', 0)
    );
    assertUnsuccessfulParse(result);
    expect(result.message).toContain(errorMessage);
  });

  test('should return an array when there is exactly one match', () => {
    const result = oneOrMore(regexp(/a/y)).parse(new Source('a', 0));
    assertSuccessfulParse(result);
    expect(result.value).toEqual(['a']);
  });

  test('should return an array containing all instances that match', () => {
    const result = oneOrMore(regexp(/a/y)).parse(new Source('aaab', 0));
    assertSuccessfulParse(result);
    expect(result.value).toEqual(['a', 'a', 'a']);
  });
});

describe('and', () => {
  test('should chain together two parsers', () => {
    const aParser = regexp(/a/y);
    const bParser = regexp(/b/y);
    const combined = aParser.and(bParser);
    const result = combined.parse(new Source('ab', 0));
    assertSuccessfulParse(result);
    expect(result.value).toBe('b');
  });
});

describe('bind', () => {
  test('should allow binding another parser after another', () => {
    const parser = regexp(/a/y).bind((a) => constant(`${a}bc`));
    const result = parser.parse(new Source('a', 0));
    assertSuccessfulParse(result);
    expect(result.value).toBe('abc');
  });
});

describe('map', () => {
  test('should allow mapping the result to some other value', () => {
    const parser = regexp(/a+/y).map((listOfAs) => listOfAs.length);
    const result = parser.parse(new Source('aaaaa', 0));
    assertSuccessfulParse(result);
    expect(result.value).toBe(5);
  });
});

describe('or', () => {
  test('should return the value of the first parser if it matches', () => {
    const parser = regexp(/a/y).or(regexp(/1/y).map(() => 1));
    const result = parser.parse(new Source('a', 0));
    assertSuccessfulParse(result);
    expect(result.value).toBe('a');
  });

  test('should return the value of the second parser if the first does not match', () => {
    const parser = regexp(/a/y).or(regexp(/1/y).map(() => 1));
    const result = parser.parse(new Source('1', 0));
    assertSuccessfulParse(result);
    expect(result.value).toBe(1);
  });
});

describe('parseStringToCompletion', () => {
  test('should return an error if parsing fails', () => {
    const result = regexp(/a/y).parseStringToCompletion('b');
    expect(result).toBeInstanceOf(ParseError);
  });

  test('should return an error if parsing does not complete', () => {
    const result = regexp(/a/y).parseStringToCompletion('aa');
    expect(result).toBeInstanceOf(ParseError);
  });

  test('should return the result if parsing is successful', () => {
    const result = regexp(/a+/y).parseStringToCompletion('aaa');
    assertSuccessfulParse(result);
    expect(result).toBe('aaa');
  });

  test('should return line where error occurred', () => {
    const input = multiline`
    line1
    line2
    line3
  `;
    const line1Parser = regexp(/line1\n/y);
    const parser = line1Parser.and(line1Parser);
    const result = parser.parseStringToCompletion(input);
    assertUnsuccessfulParse(result);
    expect(result.line).toBe(2);
  });

  test('should return column where error occurred', () => {
    const input = 'abc';
    const parser = regexp(/a/y).and(regexp(/c/y));
    const result = parser.parseStringToCompletion(input);
    assertUnsuccessfulParse(result);
    expect(result.column).toBe(2);
  });
});

describe('text', () => {
  test('should parse a simple string', () => {
    const result = text('abc').parse(new Source('abcdef', 0));
    assertSuccessfulParse(result);
    expect(result.value).toBe('abc');
    expect(result.source.getRemaining()).toBe('def');
  });
});

describe('not', () => {
  test('should succeed when a parser fails', () => {
    const result = not(text('a')).parse(new Source('b', 0));
    assertSuccessfulParse(result);
  });

  test('should fail when a parser succeeds', () => {
    const result = not(text('a')).parse(new Source('a', 0));
    assertUnsuccessfulParse(result);
  });
});

describe('whitespace', () => {
  test('matches whitespace', () => {
    const input = ' \r\n\t';
    const result = oneOrMore(whitespace).parseStringToCompletion(input);
    assertSuccessfulParse(result);
    expect(result.join('')).toBe(input);
  });
});

describe('comments', () => {
  test('matches single line comments', () => {
    const input = multiline`
      // comment
      not a comment
    `;
    const result = comments.parse(new Source(input, 0));
    assertSuccessfulParse(result);
    expect(result.value.trim()).toBe('// comment');
    expect(result.source.getRemaining().trim()).toBe('not a comment');
  });

  test('matches multi line comments', () => {
    const input = multiline`
      /*
      comment
      */
      not a comment
    `;
    const result = comments.parse(new Source(input, 0));
    assertSuccessfulParse(result);
    expect(result.value).toBe('/*\ncomment\n*/');
    expect(result.source.getRemaining().trim()).toBe('not a comment');
  });
});

describe('ignored', () => {
  test('captures whitespace', () => {
    const input = ' \r\n\t';
    const result = ignored.parse(new Source(input, 0));
    assertSuccessfulParse(result);
    expect(result.value).toEqual([input]);
  });

  test('captures comments', () => {
    const input = '// comment';
    const result = ignored.parse(new Source(input, 0));
    assertSuccessfulParse(result);
    expect(result.value).toEqual([input]);
  });

  test('captures whitespace and comments', () => {
    const input = multiline`
      // single
      /*
      multi
      */
     \r\t
     /* multi *///single
    `;
    const result = ignored.parseStringToCompletion(input);
    assertSuccessfulParse(result);
    expect(result.join('')).toBe(input);
  });
});

describe('token', () => {
  test('matches a regular expression', () => {
    const input = 'token';
    const result = token(/token/y).parseStringToCompletion(input);
    assertSuccessfulParse(result);
    expect(result).toBe(input);
  });

  test('strips out ignored text after pattern', () => {
    const input = multiline`
      token // comment

      \t
      /*
      multi
      line
      */
    `;
    const result = token(/token/y).parseStringToCompletion(input);
    assertSuccessfulParse(result);
    expect(result).toBe('token');
  });
});

describe('integer', () => {
  test('matches a zero', () => {
    const result = integer.parseStringToCompletion('0');
    assertSuccessfulParse(result);
    expect(result).toBe(0);
  });

  test('does not match numbers starting with a zero', () => {
    const result = integer.parseStringToCompletion('0123');
    assertUnsuccessfulParse(result);
  });

  test('matches numbers other than zero', () => {
    const result = integer.parseStringToCompletion('1234567890');
    assertSuccessfulParse(result);
    expect(result).toBe(1234567890);
  });

  test('allow underscore separators', () => {
    const result = integer.parseStringToCompletion('1_234_567_890');
    assertSuccessfulParse(result);
    expect(result).toBe(1234567890);
  });
});

describe('boolean', () => {
  test('matches true', () => {
    const result = boolean.parseStringToCompletion('true');
    assertSuccessfulParse(result);
    expect(result).toBe(true);
  });

  test('matches false', () => {
    const result = boolean.parseStringToCompletion('false');
    assertSuccessfulParse(result);
    expect(result).toBe(false);
  });
});

describe('escapeSequence', () => {
  test('matches a series of escape sequences', () => {
    const input = '\\b\\f\\n\\r\\t\\v\\0\\\'\\"\\\\';
    const result = oneOrMore(escapeSequence).parseStringToCompletion(input);
    assertSuccessfulParse(result);
    expect(result.join('')).toBe('\b\f\n\r\t\v\0\'"\\');
  });
});

describe('singleQuoteString', () => {
  test('matches an empty string', () => {
    const input = "''";
    const result = singleQuoteString.parseStringToCompletion(input);
    assertSuccessfulParse(result);
    expect(result).toBe('');
  });

  test('match a string', () => {
    const input = "'abc'";
    const result = singleQuoteString.parseStringToCompletion(input);
    assertSuccessfulParse(result);
    expect(result).toBe('abc');
  });

  test('match a string with an escape sequence', () => {
    const input = "'a\\nbc'";
    const result = singleQuoteString.parseStringToCompletion(input);
    assertSuccessfulParse(result);
    expect(result).toBe('a\nbc');
  });

  test('match a string with an escape single quote', () => {
    const input = "'a\\'bc'";
    const result = singleQuoteString.parseStringToCompletion(input);
    assertSuccessfulParse(result);
    expect(result).toBe("a'bc");
  });
});
