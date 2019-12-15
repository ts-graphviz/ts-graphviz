import 'jest-graphviz';
import { Digraph, Graph } from '../model/cluster';
import { digraph, graph } from '../usecase';

describe('function digraph', () => {
  it('should return Digraph object, when execute digraph()', () => {
    const g = digraph();
    expect(g).toBeInstanceOf(Digraph);
  });

  test('callback style', () => {
    const G = digraph('G', g => {
      const a = g.node('aa');
      const b = g.node('bb');
      const c = g.node('cc');
      g.edge([a, b, c], e => {
        e.attributes.set('color', 'red');
      });
      g.subgraph('A', A => {
        const Aa = A.node('Aaa', n => {
          n.attributes.set('color', 'pink');
        });
        const Ab = A.node('Abb', n => {
          n.attributes.set('color', 'violet');
        });
        const Ac = A.node('Acc');
        A.edge([Aa.port('a'), Ab, Ac, 'E'], e => {
          e.attributes.set('color', 'red');
        });
      });
    });
    const dot = G.toDot();
    expect(dot).toBeValidDotAndMatchSnapshot();
  });
});

describe('function graph', () => {
  it('should return Graph object, when execute graph()', () => {
    const g = graph();
    expect(g).toBeInstanceOf(Graph);
  });

  test('callback style', () => {
    const G = graph('G', g => {
      const a = g.node('aa');
      const b = g.node('bb');
      const c = g.node('cc');
      g.edge([a, b, c], e => {
        e.attributes.set('color', 'red');
      });
      g.subgraph('A', A => {
        const Aa = A.node('Aaa', n => {
          n.attributes.set('color', 'pink');
        });
        const Ab = A.node('Abb', n => {
          n.attributes.set('color', 'violet');
        });
        const Ac = A.node('Acc');
        A.edge([Aa, Ab, Ac, A.node('hoge').port('fuga')], e => {
          e.attributes.set('color', 'red');
        });
      });
    });
    const dot = G.toDot();
    expect(dot).toBeValidDotAndMatchSnapshot();
  });

  test('escape characters', () => {
    const G = graph('G\n"', g => {
      const a = g.node('a\na');
      a.attributes.set('label', '1\n2\n"\n3');
      const b = g.node('b"b');
      const c = g.node('c\nc"');
      g.edge([a, b, c], e => {
        e.attributes.set('color', 'red');
      });
    });
    const dot = G.toDot();
    expect(dot).toBeValidDotAndMatchSnapshot();
  });
});
