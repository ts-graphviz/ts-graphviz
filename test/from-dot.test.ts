import { Digraph, Edge, Node, RootGraph, Subgraph, fromDot } from 'ts-graphviz';

describe('fromDot function', () => {
  test('RootGraph', () => {
    const G = fromDot('digraph {}');
    expect(G).toBeInstanceOf(RootGraph);
    expect(G).toBeInstanceOf(Digraph);
    expect(G.strict).toStrictEqual(false);
  });

  test('Node', () => {
    const node = fromDot('a[ label = hoge]', { parse: { startRule: 'Node' } });
    expect(node).toBeInstanceOf(Node);
    expect(node.id).toStrictEqual('a');
    expect(node.attributes.get('label')).toStrictEqual('hoge');
  });

  test('Edge', () => {
    const edge = fromDot('a -> b [ label = hoge]', { parse: { startRule: 'Edge' } });
    expect(edge).toBeInstanceOf(Edge);
    expect(edge.targets).toMatchObject([{ id: 'a' }, { id: 'b' }]);
    expect(edge.attributes.get('label')).toStrictEqual('hoge');
  });

  test('Subgraph', () => {
    const subgraph = fromDot(
      `subgraph sub {
        label = hoge;
      }`,
      { parse: { startRule: 'Subgraph' } },
    );
    expect(subgraph).toBeInstanceOf(Subgraph);
    expect(subgraph.id).toStrictEqual('sub');
    expect(subgraph.get('label')).toStrictEqual('hoge');
  });
});
