import { describe, expect, it } from 'vitest';
import { digraph } from './model-factory.js';
import { toDot } from './to-dot.js';

describe('toDot of a model that contains itself', { tags: ['SM-5'] }, () => {
  it('throws TSG_ERR_CYCLIC_STRUCTURE', () => {
    // An uncoded RangeError (call stack exhausted) before.
    const g = digraph((g) => {
      const s = g.subgraph('s');
      s.addSubgraph(s);
    });
    expect(() => toDot(g)).toThrow(
      expect.objectContaining({
        name: 'TypeError',
        code: 'TSG_ERR_CYCLIC_STRUCTURE',
      }),
    );
  });
});
