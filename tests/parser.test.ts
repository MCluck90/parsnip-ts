import { ParseError } from '../src/error';
import { Source } from '../src/source';
import {
  constant,
  error,
  join,
  lazy,
  list,
  maybe,
  maybeWithDefault,
  not,
  oneOrMore,
  pair,
  Parser,
  regexp,
  repeat,
  text,
  zeroOrMore,
} from '../src/parser';
import { multiline } from '../src/util/string';
import { assertSuccessfulParse, assertUnsuccessfulParse } from './util';

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

describe('maybeWithDefault', () => {
  test('should return the default value if a pattern does not match', () => {
    const result = maybeWithDefault(
      new Parser((source) => source.match(/a/y)),
      'x'
    ).parse(new Source('', 0));
    assertSuccessfulParse(result);
    expect(result.value).toBe('x');
  });

  test('should return the result if a pattern does match', () => {
    const result = maybeWithDefault(
      new Parser((source) => source.match(/a/y)),
      'x'
    ).parse(new Source('abc', 0));
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

  test('will terminate when matching an optional parser', () => {
    const result = zeroOrMore(regexp(/\s*/y)).parseToEnd('');
    assertSuccessfulParse(result);
    expect(result).toEqual([]);
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

describe('concat', () => {
  test('should concatenate two string parsers', () => {
    const result = text('a').concat(text('b')).parseToEnd('ab');
    assertSuccessfulParse(result);
    expect(result).toBe('ab');
  });

  test('should fail if the parser fails', () => {
    const result = text('a').concat(text('c')).parseToEnd('ab');
    assertUnsuccessfulParse(result);
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

describe('skip', () => {
  test('should return the value of the original parser when it matches', () => {
    const parser = regexp(/a/y).skip(regexp(/b/y));
    const result = parser.parse(new Source('ab', 0));
    assertSuccessfulParse(result);
    expect(result.value).toBe('a');
    expect(result.column).toBe(3);
  });

  test('should fail if the skipped parser does not match', () => {
    const parser = regexp(/a/y).skip(regexp(/b/y));
    const result = parser.parse(new Source('ac', 0));
    assertUnsuccessfulParse(result);
  });

  test('should be chainable', () => {
    const parser = regexp(/a/y).skip(regexp(/b/y)).skip(regexp(/c/y));
    const result = parser.parse(new Source('abc', 0));
    assertSuccessfulParse(result);
    expect(result.value).toBe('a');
    expect(result.column).toBe(4);
  });
});

describe('parseStringToCompletion', () => {
  test('should return an error if parsing fails', () => {
    const result = regexp(/a/y).parseToEnd('b');
    expect(result).toBeInstanceOf(ParseError);
  });

  test('should return an error if parsing does not complete', () => {
    const result = regexp(/a/y).parseToEnd('aa');
    expect(result).toBeInstanceOf(ParseError);
  });

  test('should return the result if parsing is successful', () => {
    const result = regexp(/a+/y).parseToEnd('aaa');
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
    const result = parser.parseToEnd(input);
    assertUnsuccessfulParse(result);
    expect(result.line).toBe(2);
  });

  test('should return column where error occurred', () => {
    const input = 'abc';
    const parser = regexp(/a/y).and(regexp(/c/y));
    const result = parser.parseToEnd(input);
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

describe('repeat', () => {
  test('should repeat a parser a set number of times', () => {
    const result = repeat(text('a'), 4).parseToEnd('aaaa');
    assertSuccessfulParse(result);
  });
});

describe('lazy', () => {
  test('should execute a parser lazily', () => {
    let innerParser: Parser<string> = error('Failed');
    const parser = lazy(() => innerParser);
    innerParser = text('a');
    const result = parser.parseToEnd('a');
    assertSuccessfulParse(result);
  });
});

describe('join', () => {
  test('should join the strings from a parser which returns a string array', () => {
    const result = join(oneOrMore(text('a'))).parseToEnd('aaaa');
    assertSuccessfulParse(result);
    expect(result).toBe('aaaa');
  });
});

describe('list', () => {
  test('matches a list with a single element', () => {
    const result = list(text('a'), text(',')).parseToEnd('a');
    assertSuccessfulParse(result);
    expect(result).toEqual(['a']);
  });

  test('matches a list with multiple elements', () => {
    const result = list(text('a'), text(',')).parseToEnd('a,a,a,a,a');
    assertSuccessfulParse(result);
    expect(result).toEqual(['a', 'a', 'a', 'a', 'a']);
  });

  test('can use an arbitrary separator', () => {
    const separator = text('#START#').and(regexp(/\d{3}/y)).and(text('#END#'));
    const parser = list(text('abc'), separator);
    const input = 'abc#START#123#END#abc#START#456#END#abc';
    const result = parser.parseToEnd(input);
    assertSuccessfulParse(result);
    expect(result).toEqual(['abc', 'abc', 'abc']);
  });
});

describe('pair', () => {
  test('matches two parsers in a row', () => {
    const result = pair(text('a'), text('b')).parseToEnd('ab');
    assertSuccessfulParse(result);
  });

  test('fails if either parser fails', () => {
    const parser = pair(text('a'), text('b'));
    assertUnsuccessfulParse(parser.parseToEnd('bb'));
    assertUnsuccessfulParse(parser.parseToEnd('aa'));
  });

  test('returns matches as a tuple', () => {
    const result = pair(text('a'), text('b')).parseToEnd('ab');
    assertSuccessfulParse(result);
    expect(result).toEqual(['a', 'b']);
  });
});
