import 'jest-graphviz';
import { toDot } from '../to-dot';
import { attribute, Digraph, Graph, Node, Edge, EdgeTargetTuple } from '../../../domain';

describe('class base API', () => {
  test('digraph', () => {
    const digraph = new Digraph();
    const node1 = new Node('node1', {
      [attribute.label]: 'Node 1 label',
    });
    const node2 = new Node('node2', {
      [attribute.label]: 'Node 2 label',
    });
    const edge = new Edge([node1, node2], {
      [attribute.label]: 'Edge label',
    });
    digraph.addNode(node1);
    digraph.addNode(node2);
    digraph.addEdge(edge);
    expect(toDot(digraph)).toBeValidDotAndMatchSnapshot();
  });

  test('graph', () => {
    const graph = new Graph();
    const node1 = new Node('node1', {
      [attribute.label]: 'Node 1 label',
    });
    const node2 = new Node('node2', {
      [attribute.label]: 'Node 2 label',
    });
    const edge = new Edge([node1, node2], {
      [attribute.label]: 'Edge label',
    });
    graph.addNode(node1);
    graph.addNode(node2);
    graph.addEdge(edge);
    expect(toDot(graph)).toBeValidDotAndMatchSnapshot();
  });

  describe('custom class', () => {
    class MyCustomNode extends Node {
      constructor(id: number) {
        super(`node${id}`, {
          [attribute.label]: `This is Custom Node ${id}`,
        });
      }
    }

    class MyCustomEdge extends Edge {
      constructor(targets: EdgeTargetTuple) {
        super(targets, {
          [attribute.label]: `This is Custom Edge`,
        });
      }
    }

    class MyCustomDigraph extends Digraph {
      constructor() {
        super('G', {
          [attribute.label]: 'This is Custom Digraph',
        });
      }
    }

    class MyCustomGraph extends Graph {
      constructor() {
        super('G', {
          [attribute.label]: 'This is Custom Graph',
        });
      }
    }

    test('render custom node', () => {
      const digraph = new Digraph();
      const node = new MyCustomNode(1);
      digraph.addNode(node);
      expect(toDot(digraph)).toBeValidDotAndMatchSnapshot();
    });

    test('render custom digraph', () => {
      const digraph = new MyCustomDigraph();
      expect(toDot(digraph)).toBeValidDotAndMatchSnapshot();
    });

    test('render custom graph', () => {
      const graph = new MyCustomGraph();
      expect(toDot(graph)).toBeValidDotAndMatchSnapshot();
    });

    test('render custom edge', () => {
      const digraph = new Digraph();
      const node1 = new Node('node1', {
        [attribute.label]: 'Node 1 label',
      });
      const node2 = new Node('node2', {
        [attribute.label]: 'Node 2 label',
      });
      const edge = new MyCustomEdge([node1, node2]);
      digraph.addNode(node1);
      digraph.addNode(node2);
      digraph.addEdge(edge);
      expect(toDot(digraph)).toBeValidDotAndMatchSnapshot();
    });

    test('render custom objects', () => {
      const digraph = new MyCustomDigraph();
      const node1 = new MyCustomNode(1);
      const node2 = new MyCustomNode(2);
      const edge = new MyCustomEdge([node1, node2]);
      digraph.addNode(node1);
      digraph.addNode(node2);
      digraph.addEdge(edge);
      expect(toDot(digraph)).toBeValidDotAndMatchSnapshot();
    });
  });
});
