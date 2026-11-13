import React from 'react';
import { Digraph as DigraphModel, type NodeModel, toDot } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Edge } from './components/Edge.js';
import { Graph } from './components/Graph.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { createRoot } from './createRoot.js';
import { fromElement } from './fromElement.js';
import { elementToDot } from './test-utils/render.js';

describe('fromElement()', () => {
  describe('Without container', () => {
    it('renders a simple digraph to DOT', async () => {
      const dot = await elementToDot(
        <Digraph id="simple">
          <Node id="a" />
          <Node id="b" />
          <Edge targets={['a', 'b']} />
        </Digraph>,
      );

      expect(dot).toContain('digraph "simple"');
      expect(dot).toContain('"a"');
      expect(dot).toContain('"b"');
      expect(dot).toContain('"a" -> "b"');
    });

    it('renders a simple graph to DOT', async () => {
      const dot = await elementToDot(
        <Graph id="simple">
          <Node id="a" />
          <Node id="b" />
          <Edge targets={['a', 'b']} />
        </Graph>,
      );

      expect(dot).toContain('graph "simple"');
      expect(dot).toContain('"a"');
      expect(dot).toContain('"b"');
      expect(dot).toContain('"a" -- "b"');
    });

    it('renders a graph with subgraphs to DOT', async () => {
      const dot = await elementToDot(
        <Digraph id="complex">
          <Node id="start" />
          <Subgraph id="cluster_main">
            <Node id="a" />
            <Node id="b" />
            <Edge targets={['a', 'b']} />
          </Subgraph>
          <Edge targets={['start', 'a']} />
        </Digraph>,
      );

      expect(dot).toContain('digraph "complex"');
      expect(dot).toContain('subgraph "cluster_main"');
      expect(dot).toContain('"start"');
      expect(dot).toContain('"start" -> "a"');
    });

    it('renders an empty graph to DOT', async () => {
      const dot = await elementToDot(<Digraph id="empty" />);

      expect(dot).toContain('digraph "empty"');
      expect(dot).toContain('{}');
    });
  });

  describe('models option', () => {
    it('forwards models to createRoot and renders strict graphs', async () => {
      class MyDigraph extends DigraphModel {
        override addNode(node: NodeModel) {
          super.addNode(node);
          node.setAttribute('comment', 'custom');
        }
      }
      const dot = await elementToDot(
        <Digraph id="G" strict>
          <Node id="a" />
        </Digraph>,
        { models: { Digraph: MyDigraph } },
      );
      expect(dot).toMatch(/^strict digraph "G" \{/);
      expect(dot).toContain('comment = "custom";');
    });
  });

  describe('With container', () => {
    it('renders container with added elements to DOT', async () => {
      const container = new DigraphModel('container');

      const dot = await elementToDot(
        <>
          <Node id="a" />
          <Node id="b" />
          <Edge targets={['a', 'b']} />
        </>,
        { container },
      );

      expect(dot).toContain('digraph "container"');
      expect(dot).toContain('"a"');
      expect(dot).toContain('"b"');
      expect(dot).toContain('"a" -> "b"');
    });

    it('renders container with subgraphs to DOT', async () => {
      const container = new DigraphModel('main');

      const dot = await elementToDot(
        <>
          <Node id="start" />
          <Subgraph id="cluster_sub">
            <Node id="a" />
            <Node id="b" />
          </Subgraph>
          <Edge targets={['start', 'a']} />
        </>,
        { container },
      );

      expect(dot).toContain('digraph "main"');
      expect(dot).toContain('subgraph "cluster_sub"');
      expect(dot).toContain('"start"');
      expect(dot).toContain('"start" -> "a"');
    });

    it('renders empty fragment with container to DOT', async () => {
      const container = new DigraphModel('empty_container');

      const dot = await elementToDot(<React.Fragment />, { container });

      expect(dot).toContain('digraph "empty_container"');
      expect(dot).toContain('{}');
    });
  });

  describe('Top level without a container', () => {
    it('resolves with one Dot holding every root graph', async () => {
      const dot = await fromElement(
        <>
          <Digraph id="graph1">
            <Node id="a" />
          </Digraph>
          <Graph id="graph2">
            <Node id="b" />
          </Graph>
        </>,
      );

      expect(dot.$$type).toBe('Dot');
      expect(dot.graphs.map((graph) => graph.id)).toEqual(['graph1', 'graph2']);
      expect(toDot(dot)).toBe(
        'digraph "graph1" {\n  "a";\n}\ngraph "graph2" {\n  "b";\n}',
      );
    });

    it('resolves with an empty Dot for an element that renders nothing', async () => {
      const dot = await fromElement(<Nothing />);

      expect(dot.graphs).toEqual([]);
    });

    it('reports a node outside any graph', async () => {
      await expect(
        fromElement(
          <>
            <Node id="orphan" />
            <Edge targets={['a', 'b']} />
          </>,
        ),
      ).rejects.toThrow(
        /<Node> must be rendered inside a Digraph, Graph or Subgraph/,
      );
    });
  });

  describe('HTML-like labels', () => {
    it('renders graphs with HTML-like labels', async () => {
      const dot = await elementToDot(
        <Digraph id="html_test">
          <Node
            id="table"
            label={
              <dot:table border="0" cellborder="1" cellspacing="0">
                <dot:tr>
                  <dot:td>Cell 1</dot:td>
                  <dot:td>Cell 2</dot:td>
                </dot:tr>
              </dot:table>
            }
          />
        </Digraph>,
      );

      expect(dot).toContain('digraph "html_test"');
      expect(dot).toContain('table');
      expect(dot).toContain('Cell 1');
      expect(dot).toContain('Cell 2');
    });
  });
});

function Nothing(): null {
  return null;
}

describe("what a conversion added is the container's own afterwards", () => {
  const ids = (graph: { nodes: ReadonlyArray<NodeModel> }): string[] =>
    graph.nodes.map((n) => n.id);
  const tick = () => new Promise((resolve) => setTimeout(resolve, 10));

  it('stays when the next conversion adds to the same container', async () => {
    const container = new DigraphModel();
    await fromElement(<Node id="a" />, { container });
    await fromElement(
      <>
        <Node id="b" />
        <Edge targets={['a', 'b']} />
      </>,
      { container },
    );
    expect(ids(container)).toEqual(['a', 'b']);
    expect(container.edges).toHaveLength(1);
  });

  it('stays when a conversion that follows is rejected', async () => {
    const container = new DigraphModel();
    await fromElement(<Node id="a" />, { container });
    function Throws(): never {
      throw new Error('no');
    }
    await expect(
      fromElement(
        <>
          <Node id="b" />
          <Throws />
        </>,
        { container },
      ),
    ).rejects.toThrow('no');
    expect(ids(container)).toEqual(['a']);
  });

  it('is replaced by a node with its id, and comes back when that conversion is rejected', async () => {
    const container = new DigraphModel();
    await fromElement(<Node id="a" color="red" />, { container });
    const [first] = container.nodes;
    const controller = new AbortController();
    function Aborts(): null {
      React.useEffect(() => controller.abort(new Error('stop')), []);
      return null;
    }
    await expect(
      fromElement(
        <>
          <Node id="a" color="blue" />
          <Aborts />
        </>,
        { container, signal: controller.signal },
      ),
    ).rejects.toThrow('stop');
    expect(container.nodes).toEqual([first]);
  });

  it('stays in a graph a conversion made, used as the container of the next', async () => {
    const dot = await fromElement(
      <Digraph>
        <Node id="a" />
        <Subgraph id="s">
          <Node id="in" />
        </Subgraph>
      </Digraph>,
    );
    const [graph] = dot.graphs;
    await fromElement(<Node id="b" />, { container: graph });
    expect(ids(graph)).toEqual(['a', 'b']);
    expect(ids(graph.subgraphs[0])).toEqual(['in']);
  });

  it('stays when a root renders into the container, and when the root is unmounted', async () => {
    const container = new DigraphModel();
    await fromElement(<Node id="a" />, { container });
    const root = createRoot({ container });
    root.render(<Node id="b" />);
    await tick();
    expect(ids(container)).toEqual(['a', 'b']);
    root.unmount();
    expect(ids(container)).toEqual(['a']);
  });

  it('two roots on one container each replace what they added themselves', async () => {
    const container = new DigraphModel();
    const one = createRoot({ container });
    const two = createRoot({ container });
    one.render(<Node id="a" />);
    two.render(<Node id="b" />);
    await tick();
    one.render(<Node id="c" />);
    await tick();
    expect(ids(container).sort()).toEqual(['b', 'c']);
    two.unmount();
    expect(ids(container)).toEqual(['c']);
    one.unmount();
    expect(container.nodes).toHaveLength(0);
  });
});
