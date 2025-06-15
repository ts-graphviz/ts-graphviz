import { describe, expect, it } from 'vitest';

import {
  Digraph,
  Edge,
  type EdgeTargetTuple,
  Node,
  Subgraph,
  attribute as _,
  toDot,
  withContext,
} from 'ts-graphviz';

describe('Digraph and Subgraph Base Functionality', () => {
  it('should render a subgraph with colored nodes and custom edge attributes', () => {
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
});

describe('Subclassed Graph Components', () => {
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

  it('should render graph using custom subclassed components', () => {
    const digraph = new MyCustomDigraph();
    const node1 = new MyCustomNode('A');
    const node2 = new MyCustomNode('B');
    const edge = new MyCustomEdge([node1, node2]);
    digraph.addNode(node1);
    digraph.addNode(node2);
    digraph.addEdge(edge);
    const dot = toDot(digraph);
    expect(dot).toMatchInlineSnapshot(`
      "digraph "G" {
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
      }"
    `);
  });

  describe('Models Context API', () => {
    it('should register and create custom Node and Edge using with()', () => {
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
        "digraph {
          "node_A" [
            label = "This is Custom Node A";
          ];
          "node_B" [
            label = "This is Custom Node B";
          ];
          "node_A" -> "node_B" [
            label = "This is Custom Edge";
          ];
        }"
      `);
    });

    it('should create graph using createContext with custom classes', () => {
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
        "digraph "G" {
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
        }"
      `);
    });
  });
});
