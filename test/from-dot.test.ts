import { Digraph, Edge, Node, RootGraph, Subgraph, fromDot } from 'ts-graphviz';
import { toDot } from '#test/utils';

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

test('partially described by DOT', () => {
  const G = fromDot(
    `digraph {
      node_A [
        label = "This is a Label of Node A";
      ];
    }`,
  );

  G.edge(['node_A', 'node_B']);

  expect(toDot(G)).toMatchInlineSnapshot(`
    digraph {
      "node_A" [
        label = "This is a Label of Node A";
      ];
      "node_A" -> "node_B";
    }
  `);
});
