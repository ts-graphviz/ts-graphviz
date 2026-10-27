import { describe, expect, it } from 'vitest';
import { fromDot } from './from-dot.js';

describe('fromDot with a startRule that has no model', () => {
  it.each([
    ['Attribute', 'a = b'],
    ['AttributeList', 'node [a = b]'],
    ['ClusterStatements', 'a; b'],
  ])('rejects %s with TSG_ERR_UNCONVERTIBLE_AST', (startRule, dot) => {
    expect(() =>
      // JavaScript callers can pass any rule; the types allow only the
      // rules that have a model.
      fromDot(dot, { parse: { startRule: startRule as 'Dot' } }),
    ).toThrow(
      expect.objectContaining({
        name: 'TypeError',
        code: 'TSG_ERR_UNCONVERTIBLE_AST',
      }),
    );
  });
});
