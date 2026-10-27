import { digraph, graph, toDot } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

// End-to-end: a graph built with digraph()/graph() and printed by toDot().
// How the factories set id, directed, strict and attributes is tested in
// packages/ts-graphviz/src/model-factory(-builder).test.ts and
// test/properties/model-invariants.property.test.ts.
describe('Root graphs built with digraph() and graph()', () => {
  it('print the comments of the graph, nodes, edges and subgraphs', () => {
    const G = digraph('G', (g) => {
      g.comment = 'This is directed graph.';
      const a = g.node('aa');
      a.comment = 'This is node a.';
      const b = g.node('bb');
      b.comment = 'This is node b.';
      const c = g.node('cc');
      c.comment = 'This is node c.';
      g.edge([a, b, c], (e) => {
        e.comment = 'This is edge.\nIt connects a, b and c.';

        e.attributes.set('color', 'red');
      });
      g.subgraph('A', (A) => {
        A.comment = 'It is subgraph A.\nIt is not cluster';
        A.node('Aaa', (n) => {
          n.comment = 'This is node Aaa in subgraph A.';
          n.attributes.set('color', 'pink');
        });
      });
    });
    const dot = toDot(G);
    expect(dot).toMatchSnapshot();
  });

  it('print the ports and compass points given by node.port() and strings', () => {
    const G = graph('G', (g) => {
      const a = g.node('a');
      g.edge([
        a.port('p'),
        a.port({ port: 'q', compass: 'w' }),
        a.port({ compass: 'e' }),
        'b:r:se',
      ]);
    });
    expect(toDot(G)).toContain(
      '"a":"p" -- "a":"q":"w" -- "a":"e" -- "b":"r":"se";',
    );
  });

  it('escape special characters in names and labels', () => {
    const G = graph('G\n"', (g) => {
      const a = g.node('a\na');
      a.attributes.set('label', '1\n2\n"\n3');
      const b = g.node('b"b');
      const c = g.node('c\nc"');
      g.edge([a, b, c], (e) => {
        e.attributes.set('color', 'red');
      });

      g.subgraph('graph.name', (s) => {
        const innerA = s.node('node.name');
        innerA.attributes.set('label', 'node');
        const innerB = s.node('another.name');
        innerB.attributes.set('label', 'words with space and "quote"');
        s.edge([innerA, innerB]);
      });
    });
    const dot = toDot(G);
    expect(dot).toMatchSnapshot();
  });
});
