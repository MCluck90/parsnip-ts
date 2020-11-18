import fs from 'fs';
import path from 'path';
import { ParseError } from '../src/error';
import { signedFloatingPoint, signedInteger } from '../src/numbers';
import {
  constant,
  error,
  join,
  lazy,
  Parser,
  regexp,
  repeat,
  text,
  zeroOrMore,
} from '../src/parser';

interface JsonObject {
  [key: string]: Json;
}
type Json = null | boolean | number | string | Json[] | JsonObject;

const ws = regexp(/[\u0020|\u000A|\u000D|\u0009]*/y);

const number = signedFloatingPoint.or(signedInteger);

const hex = regexp(/[0-9a-fA-F]/y);

const escape = regexp(/["\\/bfnrt]/y).or(
  text('u')
    .and(join(repeat(hex, 4)))
    .map((h) => `\\u${h}`)
);

const character = regexp(/(?:(?!["\\])[\u0020-\u10FFFF])/y).or(
  text('\\').and(escape)
);

const characters = join(zeroOrMore(character));

const string = text('"').and(
  characters.bind((str) => text('"').map(() => str))
);

// Must be defined after other rules. Use `lazy` to include it in rules before it's defined
let elementDefinition: Parser<Json> = error('Used before defined');
const element = lazy(() => elementDefinition);

const elements = element.bind((firstElem) =>
  zeroOrMore(text(',').and(element)).map((elems) => [firstElem, ...elems])
);

const array = text('[')
  .and(elements.or(ws.map(() => [] as Json[])))
  .bind((elems) => text(']').map(() => elems));

const member: Parser<[string, Json]> = ws
  .and(string)
  .bind((key) => ws.and(text(':')).and(element.map((value) => [key, value])));

const members = member.bind((first) =>
  zeroOrMore(text(',').and(member)).map((others) => [first, ...others])
);

const object = text('{').and(
  members.or(ws.map(() => [] as [string, Json][])).bind((mems) =>
    text('}').map(() =>
      mems.reduce((prev, [key, value]) => {
        prev[key] = value;
        return prev;
      }, {} as Record<string, Json>)
    )
  )
);

const value = object
  .or(array)
  .or(string)
  .or(number)
  .or(text('true').and(constant(true)))
  .or(text('false').and(constant(false)))
  .or(text('null').and(constant(null)));

elementDefinition = ws.and(value.bind((val) => ws.map(() => val)));

const json: Parser<Json> = element;

function assertSuccessfulParse<T>(result: ParseError | T): asserts result is T {
  if (result instanceof ParseError) {
    throw result;
  }
}

describe('json', () => {
  test('match package.json', () => {
    const contents = fs
      .readFileSync(path.join(__dirname, '../package.json'))
      .toString();
    const result = json.parseStringToCompletion(contents);
    assertSuccessfulParse(result);
  });

  test('parse a number', () => {
    const result = json.parseStringToCompletion('123.4e56');
    assertSuccessfulParse(result);
    expect(result).toBe(123.4e56);
  });

  test('parse a string', () => {
    const result = json.parseStringToCompletion('"hello"');
    assertSuccessfulParse(result);
    expect(result).toBe('hello');
  });

  test('parse an object', () => {
    const input = {
      a: 1,
      b: 'b',
      c: {
        d: [],
      },
    };
    const result = json.parseStringToCompletion(JSON.stringify(input));
    assertSuccessfulParse(result);
    expect(result).toEqual(input);
  });

  test('parse an array', () => {
    const result = json.parseStringToCompletion('[1, 2, 3]');
    assertSuccessfulParse(result);
    expect(result).toEqual([1, 2, 3]);
  });

  test('creates equivalent value to package.json', () => {
    const contents = fs
      .readFileSync(path.join(__dirname, '../package.json'))
      .toString();
    const result = json.parseStringToCompletion(contents);
    assertSuccessfulParse(result);
    const packageJson = JSON.parse(contents);
    expect(result).toEqual(packageJson);
  });
});
