import { describe, expect, it } from 'vitest';
import { DotSyntaxError, parse } from './parse.js';

function syntaxError(dot: string, options?: Parameters<typeof parse>[1]) {
  try {
    parse(dot, options);
  } catch (e) {
    return e as DotSyntaxError;
  }
  throw new Error(`parsed ${JSON.stringify(dot)}`);
}

// The contract of DotSyntaxError is `code` and `location`; the message and
// `cause` belong to the parser implementation and may change.
describe('[SM-1] DotSyntaxError', () => {
  it('says where a syntax error is', () => {
    const error = syntaxError('digraph {\n  a -> ;\n}');
    expect(error).toBeInstanceOf(DotSyntaxError);
    expect(error).toBeInstanceOf(SyntaxError);
    expect(error.code).toBe('TSG_ERR_DOT_SYNTAX');
    expect(error.location?.start).toMatchObject({ line: 2, column: 8 });
    expect(error.location).not.toHaveProperty('source');
  });

  it('says where a NUL character is', () => {
    expect(syntaxError('digraph {\n a\0 }').location).toStrictEqual({
      start: { offset: 12, line: 2, column: 3 },
      end: { offset: 13, line: 2, column: 4 },
    });
  });

  it('says where a wrong edge operator is', () => {
    expect(syntaxError('graph { a -> b }').location?.start).toMatchObject({
      line: 1,
      column: 11,
    });
  });

  it('has no location for an input over maxInputSize', () => {
    const error = syntaxError('digraph { a }', { maxInputSize: 4 });
    expect(error.code).toBe('TSG_ERR_DOT_SYNTAX');
    expect(error.location).toBeUndefined();
  });
});
