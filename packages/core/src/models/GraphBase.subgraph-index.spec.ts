import { describe, expect, it } from 'vitest';
import { Digraph } from './Digraph.js';
import { Subgraph } from './Subgraph.js';

describe('subgraphs by id', () => {
  it('finds subgraphs without scanning them all', () => {
    // Every lookup read the id of every subgraph before (4.7 s for 20 000).
    const g = new Digraph();
    let reads = 0;
    const count = 1000;
    for (let i = 0; i < count; i++) {
      const s = new Subgraph(`s${i}`);
      const id = s.id;
      Object.defineProperty(s, 'id', {
        get: () => {
          reads++;
          return id;
        },
      });
      g.addSubgraph(s);
    }
    reads = 0;
    for (let i = 0; i < count; i++) g.getSubgraph(`s${i}`);
    expect(reads).toBeLessThanOrEqual(count);
  });

  it('takes out a custom subgraph whose id changed under the id it was added with', () => {
    const g = new Digraph();
    const s = new Subgraph('a');
    let id = 'a';
    Object.defineProperty(s, 'id', { get: () => id });
    g.addSubgraph(s);
    id = 'b';
    expect(g.getSubgraph('a')).toBeUndefined();
    g.removeSubgraph(s);
    id = 'a';
    expect(g.getSubgraph('a')).toBeUndefined();
  });

  it('gives the first one added with an id, then the next once it is removed', () => {
    const g = new Digraph();
    const first = new Subgraph('s');
    const second = new Subgraph('s');
    g.addSubgraph(first);
    g.addSubgraph(second);
    g.addSubgraph(first); // again: no change
    expect(g.getSubgraph('s')).toBe(first);
    g.removeSubgraph(first);
    expect(g.getSubgraph('s')).toBe(second);
    g.removeSubgraph(first); // not there: no change
    expect(g.getSubgraph('s')).toBe(second);
    g.removeSubgraph(second);
    expect(g.getSubgraph('s')).toBeUndefined();
    g.addSubgraph(first);
    expect(g.getSubgraph('s')).toBe(first);
  });

  it('does not index subgraphs without an id', () => {
    const g = new Digraph();
    const anonymous = g.createSubgraph();
    expect(g.getSubgraph('undefined')).toBeUndefined();
    expect(g.subgraphs).toStrictEqual([anonymous]);
  });

  it('reads ids that are Object.prototype names as ids', () => {
    const g = new Digraph();
    expect(g.getSubgraph('constructor')).toBeUndefined();
    const s = g.subgraph('constructor');
    expect(g.getSubgraph('constructor')).toBe(s);
  });
});
