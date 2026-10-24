import { describe, expect, it } from 'vitest';
import { Digraph } from './Digraph.js';

describe('GraphBase small fixes (#1593)', () => {
  it("subgraph('') looks up / creates the subgraph with the empty id", () => {
    const g = new Digraph();
    const first = g.subgraph('');
    expect(first.id).toBe('');
    expect(g.subgraph('')).toBe(first);
    expect(g.subgraphs).toHaveLength(1);
    // an anonymous subgraph is still created when no id is given
    expect(g.subgraph().id).toBeUndefined();
    expect(g.subgraphs).toHaveLength(2);
  });

  it('edge(targets, null) ignores the null instead of throwing', () => {
    const g = new Digraph();
    const e = g.edge(['a', 'b'], null as never);
    expect(e.attributes.size).toBe(0);
    expect(g.edges).toHaveLength(1);
  });
});
