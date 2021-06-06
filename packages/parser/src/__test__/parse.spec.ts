import { Digraph, Edge, Node, RootCluster, Subgraph } from 'ts-graphviz';
import _ from 'ts-dedent';
import { parse } from '../parse';

describe('parse function', () => {
  test('RootCluster', () => {
    const G = parse('digraph {}');
    expect(G).toBeInstanceOf(RootCluster);
    expect(G).toBeInstanceOf(Digraph);
    expect(G.strict).toStrictEqual(false);
  });

  test('Node', () => {
    const node = parse('a[ label = hoge]', { rule: 'node' });
    expect(node).toBeInstanceOf(Node);
    expect(node.id).toStrictEqual('a');
    expect(node.attributes.get('label')).toStrictEqual('hoge');
  });

  test('Edge', () => {
    const edge = parse('a -> b [ label = hoge]', { rule: 'edge' });
    expect(edge).toBeInstanceOf(Edge);
    expect(edge.targets).toMatchObject([{ id: 'a' }, { id: 'b' }]);
    expect(edge.attributes.get('label')).toStrictEqual('hoge');
  });

  test('Subgraph', () => {
    const subgraph = parse(
      _`
      subgraph sub {
        label = hoge;
      }
      `,
      { rule: 'subgraph' },
    );
    expect(subgraph).toBeInstanceOf(Subgraph);
    expect(subgraph.id).toStrictEqual('sub');
    expect(subgraph.get('label')).toStrictEqual('hoge');
  });
});
