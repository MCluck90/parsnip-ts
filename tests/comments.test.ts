import { cStyleComment } from '../src/comments';
import { Source } from '../src/source';
import { multiline } from '../src/util/string';
import { assertSuccessfulParse } from './util';

describe('cStyleComment', () => {
  test('matches single line comments', () => {
    const input = multiline`
      // comment
      not a comment
    `;
    const result = cStyleComment.parse(new Source(input, 0));
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
    const result = cStyleComment.parse(new Source(input, 0));
    assertSuccessfulParse(result);
    expect(result.value).toBe('/*\ncomment\n*/');
    expect(result.source.getRemaining().trim()).toBe('not a comment');
  });

  test('matches nested multi line comments', () => {
    const input = multiline`
      /*
      comment
      /*
      also a comment
      */
      */
      not a comment
    `;
    const result = cStyleComment.parse(new Source(input, 0));
    assertSuccessfulParse(result);
    expect(result.value).toBe('/*\ncomment\n/*\nalso a comment\n*/\n*/');
    expect(result.source.getRemaining().trim()).toBe('not a comment');
  });
});
