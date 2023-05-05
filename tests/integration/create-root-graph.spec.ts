import { digraph, graph, strict, Graph, Digraph, attribute as _ } from 'ts-graphviz';
import { toDot } from '#test/utils';

describe('function digraph', () => {
  it('should return Graph object, when execute digraph()', () => {
    const g = digraph();
    expect(g).toBeInstanceOf(Digraph);
    expect(g.strict).toBe(false);
    expect(g.directed).toBe(true);
  });

  describe('root create function', () => {
    test.each([
      ['id', { size: 0, id: 'id', strictMode: false, g: digraph('id') }],
      [
        'id with attributes',
        {
          size: 1,
          id: 'id',
          strictMode: false,
          g: digraph('id', {
            [_.label]: 'Label',
          }),
        },
      ],
      [
        'no parameters',
        {
          size: 0,
          id: undefined,
          strictMode: false,
          g: digraph(),
        },
      ],
      [
        'strict no parameters',
        {
          size: 0,
          id: undefined,
          strictMode: true,
          g: strict.digraph(),
        },
      ],
      [
        'no id with attributes',
        {
          size: 1,
          id: undefined,
          strictMode: false,
          g: digraph({
            [_.label]: 'Label',
          }),
        },
      ],
      [
        'strict with attributes',
        {
          size: 1,
          id: undefined,
          strictMode: true,
          g: strict.digraph({
            [_.label]: 'Label',
          }),
        },
      ],
      [
        'strict id with attributes',
        {
          size: 1,
          id: 'id',
          strictMode: true,
          g: strict.digraph('id', {
            [_.label]: 'Label',
          }),
        },
      ],
      [
        'strict no id with attributes',
        {
          size: 1,
          id: undefined,
          strictMode: true,
          g: strict.digraph({
            [_.label]: 'Label',
          }),
        },
      ],
    ])('%s', (_, { id, size, strictMode, g }) => {
      expect(g.id).toBe(id);
      expect(g.size).toBe(size);
      expect(g.strict).toBe(strictMode);
      expect(toDot(g)).toMatchSnapshot();
    });
  });

  test('callback style', () => {
    const G = digraph('G', (g) => {
      const a = g.node('aa');
      const b = g.node('bb');
      const c = g.node('cc');
      g.edge([a, b, c], (e) => {
        e.attributes.set('color', 'red');
      });
      g.subgraph('A', (A) => {
        const Aa = A.node('Aaa', (n) => {
          n.attributes.set('color', 'pink');
        });
        const Ab = A.node('Abb', (n) => {
          n.attributes.set('color', 'violet');
        });
        const Ac = A.node('Acc');
        A.edge([Aa.port('a'), Ab, Ac, 'E'], (e) => {
          e.attributes.set('color', 'red');
        });
      });
    });
    const dot = toDot(G);
    expect(dot).toMatchSnapshot();
  });

  test('callback style, set attributes by attributes object', () => {
    const G = digraph('G', (g) => {
      const a = g.node('aa');
      const b = g.node('bb');
      const c = g.node('cc');
      g.edge([a, b, c], {
        [_.color]: 'red',
      });
      g.subgraph('A', (A) => {
        const Aa = A.node('Aaa', {
          [_.color]: 'pink',
        });

        const Ab = A.node('Abb', {
          [_.color]: 'violet',
        });
        const Ac = A.node('Acc');
        A.edge([Aa.port('a'), Ab, Ac, 'E'], {
          [_.color]: 'red',
        });
      });
    });
    const dot = toDot(G);
    expect(dot).toMatchSnapshot();
  });

  test('comment', () => {
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
        e.attributes.comment = 'Edge line will draw with red.';
      });
      g.subgraph('A', (A) => {
        A.comment = 'It is subgraph A.\nIt is not cluster';
        A.node('Aaa', (n) => {
          n.comment = 'This is node Aaa in subgraph A.';
          n.attributes.comment = 'It will be filled by pink.';
          n.attributes.set('color', 'pink');
        });
      });
    });
    const dot = toDot(G);
    expect(dot).toMatchSnapshot();
  });
});

describe('function graph', () => {
  it('should return Graph object, when execute graph()', () => {
    const g = graph();
    expect(g).toBeInstanceOf(Graph);
  });

  it('script style', () => {
    const g = digraph('G');
    const subgraphA = g.createSubgraph('A');
    const nodeA1 = subgraphA.createNode('A_node1');
    const nodeA2 = subgraphA.createNode('A_node2');
    subgraphA.createEdge([nodeA1, nodeA2]);

    const subgraphB = g.createSubgraph('B');
    const nodeB1 = subgraphB.createNode('B_node1');
    const nodeB2 = subgraphB.createNode('B_node2');
    subgraphA.createEdge([nodeB1, nodeB2]);

    const node1 = g.createNode('node1');
    const node2 = g.createNode('node2');
    g.createEdge([node1, node2]);
    const dot = toDot(g);
    expect(dot).toMatchSnapshot();
  });

  test('callback style', () => {
    const G = graph('G', (g) => {
      const a = g.node('aa');
      const b = g.node('bb');
      const c = g.node('cc');
      g.edge([a, b, c], (e) => {
        e.attributes.set('color', 'red');
      });
      g.subgraph('A', (A) => {
        const Aa = A.node('Aaa', (n) => {
          n.attributes.set('color', 'pink');
        });
        const Ab = A.node('Abb', (n) => {
          n.attributes.set('color', 'violet');
        });
        const Ac = A.node('Acc');
        A.edge([Aa, Ab, Ac, A.node('hoge').port('fuga')], (e) => {
          e.attributes.set('color', 'red');
        });

        A.edge([Aa.port({ port: 'a', compass: 'w' }), Ab.port({ compass: 'w' }), 'Aaa:e', 'Acc:r:e'], (e) => {
          e.attributes.set('color', 'red');
        });
      });
    });
    const dot = toDot(G);
    expect(dot).toMatchSnapshot();
  });

  test('callback style, set attributes by attributes object', () => {
    const G = graph('G', (g) => {
      const a = g.node('aa');
      const b = g.node('bb');
      const c = g.node('cc');
      g.edge([a, b, c], {
        [_.color]: 'red',
      });
      g.subgraph('A', (A) => {
        const Aa = A.node('Aaa', {
          [_.color]: 'pink',
        });

        const Ab = A.node('Abb', {
          [_.color]: 'violet',
        });
        const Ac = A.node('Acc');
        A.edge([Aa.port('a'), Ab, Ac, 'E'], {
          [_.color]: 'red',
        });
      });
    });
    const dot = toDot(G);
    expect(dot).toMatchSnapshot();
  });

  test('escape characters', () => {
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

describe('strict mode', () => {
  it('should return Digraph object, when execute digraph()', () => {
    const g = strict.digraph();
    expect(g).toBeInstanceOf(Digraph);
    expect(g.strict).toBe(true);
    expect(g.directed).toBe(true);
  });

  it('should return Graph object, when execute graph()', () => {
    const g = strict.graph();
    expect(g).toBeInstanceOf(Graph);
    expect(g.strict).toBe(true);
  });
});
