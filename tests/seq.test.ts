import { boolean } from '../src/boolean';
import { ParseError } from '../src/error';
import { integer } from '../src/numbers';
import { seq } from '../src/seq';
import { whitespace } from '../src/whitespace';
import { assertSuccessfulParse } from './util';

describe('seq', () => {
  test('matches a pair of parsers', () => {
    const result: [number, boolean] | ParseError = seq([
      integer,
      boolean,
    ]).parseToEnd('10true');
    assertSuccessfulParse(result);
    expect(result).toEqual([10, true]);
  });

  test('matches a triplet of parser', () => {
    const result: [number, boolean, string] | ParseError = seq([
      integer,
      boolean,
      whitespace,
    ]).parseToEnd('1true ');
    assertSuccessfulParse(result);
    expect(result).toEqual([1, true, ' ']);
  });

  test('matches 4 parsers', () => {
    const result: [number, boolean, string, number] | ParseError = seq([
      integer,
      boolean,
      whitespace,
      integer,
    ]).parseToEnd('1true 2');
    assertSuccessfulParse(result);
    expect(result).toEqual([1, true, ' ', 2]);
  });

  test('matches 5 parsers', () => {
    const result:
      | [number, boolean, string, number, boolean]
      | ParseError = seq([
      integer,
      boolean,
      whitespace,
      integer,
      boolean,
    ]).parseToEnd('1true 2false');
    assertSuccessfulParse(result);
    expect(result).toEqual([1, true, ' ', 2, false]);
  });

  test('matches 6 parsers', () => {
    const result:
      | [number, boolean, string, number, boolean, string]
      | ParseError = seq([
      integer,
      boolean,
      whitespace,
      integer,
      boolean,
      whitespace,
    ]).parseToEnd('1true 2false ');
    assertSuccessfulParse(result);
    expect(result).toEqual([1, true, ' ', 2, false, ' ']);
  });

  test('matches 7 parsers', () => {
    const result:
      | [number, boolean, string, number, boolean, string, number]
      | ParseError = seq([
      integer,
      boolean,
      whitespace,
      integer,
      boolean,
      whitespace,
      integer,
    ]).parseToEnd('1true 2false 3');
    assertSuccessfulParse(result);
    expect(result).toEqual([1, true, ' ', 2, false, ' ', 3]);
  });

  test('matches 8 parsers', () => {
    const result:
      | [number, boolean, string, number, boolean, string, number, boolean]
      | ParseError = seq([
      integer,
      boolean,
      whitespace,
      integer,
      boolean,
      whitespace,
      integer,
      boolean,
    ]).parseToEnd('1true 2false 3true');
    assertSuccessfulParse(result);
    expect(result).toEqual([1, true, ' ', 2, false, ' ', 3, true]);
  });
});
