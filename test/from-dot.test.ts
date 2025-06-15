import {
  Digraph,
  Edge,
  Node,
  RootGraph,
  Subgraph,
  fromDot,
  toDot,
} from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

describe('fromDot API', () => {
  describe('Parsing DOT statements', () => {
    it('parses an empty digraph into a RootGraph instance', () => {
      const G = fromDot('digraph {}');
      expect(G).toBeInstanceOf(RootGraph);
      expect(G).toBeInstanceOf(Digraph);
      expect(G.strict).toStrictEqual(false);
    });

    it('parses a node statement into a Node instance with correct id and attributes', () => {
      const node = fromDot('a[ label = hoge]', {
        parse: { startRule: 'Node' },
      });
      expect(node).toBeInstanceOf(Node);
      expect(node.id).toStrictEqual('a');
      expect(node.attributes.get('label')).toStrictEqual('hoge');
    });

    it('parses an edge statement into an Edge instance with correct targets and attributes', () => {
      const edge = fromDot('a -> b [ label = hoge]', {
        parse: { startRule: 'Edge' },
      });
      expect(edge).toBeInstanceOf(Edge);
      expect(edge.targets).toMatchObject([{ id: 'a' }, { id: 'b' }]);
      expect(edge.attributes.get('label')).toStrictEqual('hoge');
    });

    it('parses a subgraph statement into a Subgraph instance with id and attributes', () => {
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

  describe('Manipulating parsed graphs', () => {
    it('allows adding edges to a partially defined graph and serializes correctly', () => {
      const G = fromDot(
        `digraph {
          node_A [
            label = "This is a Label of Node A";
          ];
        }`,
      );

      G.edge(['node_A', 'node_B']);

      expect(toDot(G)).toMatchInlineSnapshot(`
        "digraph {
          "node_A" [
            label = "This is a Label of Node A";
          ];
          "node_A" -> "node_B";
        }"
      `);
    });

    it('serializes edges to single-element target groups correctly', () => {
      const G = fromDot(
        `digraph {
          node_A -> { node_B };
        }`,
      );

      expect(toDot(G)).toMatchInlineSnapshot(
        `
        "digraph {
          "node_A" -> {"node_B"};
        }"
      `,
      );
    });
  });
});
