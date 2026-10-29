import { spawnSync } from 'node:child_process';
import { digraph, fromDot, Node, toDot } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

// A graph keeps its nodes, edges and subgraphs in the order they were
// added, and toDot writes them in that order (#1732): node order affects
// the layout Graphviz makes.
describe('statement order', () => {
  it('keeps nodes, edges and subgraphs in the order they were added', () => {
    const g = digraph((g) => {
      g.edge(['a', 'b']);
      g.node('c');
      g.subgraph('s', (s) => s.node('d'));
      g.edge(['d', 'e']);
    });
    expect(
      g.statements.map((s) =>
        s.$$type === 'Node'
          ? `node ${s.id}`
          : s.$$type === 'Edge'
            ? 'edge'
            : s.$$type,
      ),
    ).toEqual(['edge', 'node c', 'Subgraph', 'edge']);
    expect(toDot(g).replace(/\s+/g, ' ')).toBe(
      'digraph { "a" -> "b"; "c"; subgraph "s" { "d"; } "d" -> "e"; }',
    );
  });

  it('keeps the place of a node replaced by one with the same id, and forgets removed ones', () => {
    const g = digraph((g) => {
      g.node('a');
      g.node('b');
    });
    const replacement = new Node('a', { color: 'red' });
    g.addNode(replacement);
    expect(g.statements).toEqual([replacement, g.getNode('b')]);
    g.removeNode('a');
    expect(g.statements.map((s) => (s.$$type === 'Node' ? s.id : '?'))).toEqual(
      ['b'],
    );
  });

  it('renders a DOT source with interleaved nodes and edges as the source does', {
    tags: ['process'],
  }, ({ skip }) => {
    skip(
      spawnSync('dot', ['-V'], { timeout: 10_000 }).status !== 0,
      'dot is not installed',
    );
    const dot = 'digraph { a -> b; c; d -> e }';
    const canon = (s: string) => {
      const r = spawnSync('dot', ['-Tcanon'], {
        input: s,
        encoding: 'utf8',
        timeout: 30_000,
      });
      expect(r.status, `${s}\n${r.stderr}`).toBe(0);
      return r.stdout;
    };
    expect(canon(toDot(fromDot(dot)))).toBe(canon(dot));
  });
});
