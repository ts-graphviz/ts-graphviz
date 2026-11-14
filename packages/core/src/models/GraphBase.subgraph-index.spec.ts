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
    for (let i = 0; i < count; i++) g.getSubgraphs(`s${i}`);
    expect(reads).toBeLessThanOrEqual(count);
  });

  it('takes out a custom subgraph whose id changed under the id it was added with', () => {
    const g = new Digraph();
    const s = new Subgraph('a');
    let id = 'a';
    Object.defineProperty(s, 'id', { get: () => id });
    g.addSubgraph(s);
    id = 'b';
    expect(g.getSubgraphs('a')).toEqual([]);
    g.removeSubgraph(s);
    id = 'a';
    expect(g.getSubgraphs('a')).toEqual([]);
  });

  it('gives the first one added with an id, then the next once it is removed', () => {
    const g = new Digraph();
    const first = new Subgraph('s');
    const second = new Subgraph('s');
    g.addSubgraph(first);
    g.addSubgraph(second);
    g.addSubgraph(first); // again: no change
    expect(g.getSubgraphs('s')).toStrictEqual([first, second]);
    g.removeSubgraph(first);
    expect(g.getSubgraphs('s')[0]).toBe(second);
    g.removeSubgraph(first); // not there: no change
    expect(g.getSubgraphs('s')[0]).toBe(second);
    g.removeSubgraph(second);
    expect(g.getSubgraphs('s')).toEqual([]);
    g.addSubgraph(first);
    expect(g.getSubgraphs('s')[0]).toBe(first);
  });

  it('does not index subgraphs without an id', () => {
    const g = new Digraph();
    const anonymous = new Subgraph();
    g.addSubgraph(anonymous);
    expect(g.getSubgraphs('undefined')).toEqual([]);
    expect(g.subgraphs).toStrictEqual([anonymous]);
  });

  it('reads ids that are Object.prototype names as ids', () => {
    const g = new Digraph();
    expect(g.getSubgraphs('constructor')).toEqual([]);
    const s = new Subgraph('constructor');
    g.addSubgraph(s);
    expect(g.getSubgraphs('constructor')[0]).toBe(s);
  });
});
