import { Digraph, Edge, Node, Subgraph, attribute as _, EdgeTargetTuple, withContext } from 'ts-graphviz';
import { toDot } from '#test/utils';

test('class base', () => {
  const G = new Digraph();
  const A = new Subgraph('A');
  const node1 = new Node('node1', {
    [_.color]: 'red',
  });
  const node2 = new Node('node2', {
    [_.color]: 'blue',
  });
  const edge = new Edge([node1, node2], {
    [_.label]: 'Edge Label',
    [_.color]: 'pink',
  });
  G.addSubgraph(A);
  A.addNode(node1);
  A.addNode(node2);
  A.addEdge(edge);
  const dot = toDot(G);
  expect(dot).toMatchSnapshot();
});

describe('Custom Class', () => {
  class MyCustomDigraph extends Digraph {
    constructor() {
      super('G', {
        [_.label]: 'This is Custom Digraph',
      });
    }
  }
  class MyCustomNode extends Node {
    constructor(id: string) {
      super(`node_${id}`, {
        [_.label]: `This is Custom Node ${id}`,
      });
    }
  }

  class MyCustomEdge extends Edge {
    constructor(targets: EdgeTargetTuple) {
      super(targets, {
        [_.label]: 'This is Custom Edge',
      });
    }
  }

  test('OOP', () => {
    const digraph = new MyCustomDigraph();
    const node1 = new MyCustomNode('A');
    const node2 = new MyCustomNode('B');
    const edge = new MyCustomEdge([node1, node2]);
    digraph.addNode(node1);
    digraph.addNode(node2);
    digraph.addEdge(edge);
    const dot = toDot(digraph);
    expect(dot).toMatchInlineSnapshot(`
      digraph "G" {
        label = "This is Custom Digraph";
        "node_A" [
          label = "This is Custom Node A";
        ];
        "node_B" [
          label = "This is Custom Node B";
        ];
        "node_A" -> "node_B" [
          label = "This is Custom Edge";
        ];
      }
    `);
  });

  describe('Models Context API', () => {
    test('with method', () => {
      const g = new Digraph();
      g.with({
        Node: MyCustomNode,
        Edge: MyCustomEdge,
      });
      const a = g.createNode('A');
      const b = g.createNode('B');
      expect(a).toBeInstanceOf(MyCustomNode);
      expect(g.createEdge([a, b])).toBeInstanceOf(MyCustomEdge);
      const dot = toDot(g);
      expect(dot).toMatchInlineSnapshot(`
        digraph {
          "node_A" [
            label = "This is Custom Node A";
          ];
          "node_B" [
            label = "This is Custom Node B";
          ];
          "node_A" -> "node_B" [
            label = "This is Custom Edge";
          ];
        }
      `);
    });

    test('createContext', () => {
      const { digraph } = withContext({
        Digraph: MyCustomDigraph,
        Node: MyCustomNode,
        Edge: MyCustomEdge,
      });

      const G = digraph((g) => {
        const a = g.node('A'); // MyCustomNode
        const b = g.node('B'); // MyCustomNode
        g.edge([a, b]); // MyCustomEdge
      });

      const dot = toDot(G);
      expect(dot).toMatchInlineSnapshot(`
        digraph "G" {
          label = "This is Custom Digraph";
          "node_A" [
            label = "This is Custom Node A";
          ];
          "node_B" [
            label = "This is Custom Node B";
          ];
          "node_A" -> "node_B" [
            label = "This is Custom Edge";
          ];
        }
      `);
    });
  });
});
