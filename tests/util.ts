import { ParseError } from '../src/error';

export function assertSuccessfulParse<T>(
  result: ParseError | T
): asserts result is T {
  if (result instanceof ParseError) {
    throw result;
  }
}

export function assertUnsuccessfulParse<T>(
  result: T | ParseError
): asserts result is ParseError {
  if (!(result instanceof ParseError)) {
    expect(result).toBeInstanceOf(ParseError);
  }
}
