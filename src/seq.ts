import { pair, Parser } from './parser';

export function seq<T1, T2>(
  parsers: [Parser<T1>, Parser<T2>]
): Parser<[T1, T2]>;
export function seq<T1, T2, T3>(
  parsers: [Parser<T1>, Parser<T2>, Parser<T3>]
): Parser<[T1, T2, T3]>;
export function seq<T1, T2, T3, T4>(
  parsers: [Parser<T1>, Parser<T2>, Parser<T3>, Parser<T4>]
): Parser<[T1, T2, T3, T4]>;
export function seq<T1, T2, T3, T4, T5>(
  parsers: [Parser<T1>, Parser<T2>, Parser<T3>, Parser<T4>, Parser<T5>]
): Parser<[T1, T2, T3, T4, T5]>;
export function seq<T1, T2, T3, T4, T5, T6>(
  parsers: [
    Parser<T1>,
    Parser<T2>,
    Parser<T3>,
    Parser<T4>,
    Parser<T5>,
    Parser<T6>
  ]
): Parser<[T1, T2, T3, T4, T5, T6]>;
export function seq<T1, T2, T3, T4, T5, T6, T7>(
  parsers: [
    Parser<T1>,
    Parser<T2>,
    Parser<T3>,
    Parser<T4>,
    Parser<T5>,
    Parser<T6>,
    Parser<T7>
  ]
): Parser<[T1, T2, T3, T4, T5, T6, T7]>;
export function seq<T1, T2, T3, T4, T5, T6, T7, T8>(
  parsers: [
    Parser<T1>,
    Parser<T2>,
    Parser<T3>,
    Parser<T4>,
    Parser<T5>,
    Parser<T6>,
    Parser<T7>,
    Parser<T8>
  ]
): Parser<[T1, T2, T3, T4, T5, T6, T7, T8]>;

/**
 * RUn a sequence of parsers and return the result as a tuple
 *
 * ```ts
 * const assignment = seq([
 *   identifier,
 *   assignmentOperator,
 *   expression
 * ])
 * ```
 *
 * @param parsers Array of parsers to match
 */
export function seq(parsers: Parser<unknown>[]): Parser<unknown> {
  let parser = pair(parsers[0], parsers[1]);

  for (let i = 2; i < parsers.length; i++) {
    parser = pair(parser, parsers[i]);
  }

  return parser.map((result) => result.flat(parsers.length));
}
