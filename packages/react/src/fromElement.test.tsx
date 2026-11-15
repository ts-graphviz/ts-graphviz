import React from 'react';
import { Digraph as DigraphModel, Node as NodeModel, toDot } from 'ts-graphviz';
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

  describe('retries option', () => {
    it('takes a non-negative integer', async () => {
      const element = (
        <Digraph id="G">
          <Node id="a" />
        </Digraph>
      );
      await expect(fromElement(element, { retries: 2 })).resolves.toBeDefined();
      await expect(fromElement(element, { retries: -1 })).rejects.toThrow(
        new RangeError('retries must be a non-negative integer'),
      );
      await expect(fromElement(element, { retries: 1.5 })).rejects.toThrow(
        RangeError,
      );
      await expect(
        fromElement(element, { retries: Number.POSITIVE_INFINITY }),
      ).rejects.toThrow(RangeError);
      await expect(
        fromElement(element, { retries: '1' as unknown as number }),
      ).rejects.toThrow(new TypeError('retries must be a number'));
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
  const ids = (graph: { nodes: ReadonlyArray<{ id: string }> }): string[] =>
    graph.nodes.map((n) => n.id);
  /** A root on the container, and a render that waits for its commit. */
  const rootOn = (container: DigraphModel) => {
    let committed = (): void => {};
    const root = createRoot({
      container,
      onRenderComplete: () => committed(),
    });
    return {
      unmount: () => root.unmount(),
      render: (element: React.ReactElement) =>
        new Promise<void>((resolve) => {
          committed = resolve;
          root.render(element);
        }),
    };
  };

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
    const root = rootOn(container);
    await root.render(<Node id="b" />);
    expect(ids(container)).toEqual(['a', 'b']);
    root.unmount();
    expect(ids(container)).toEqual(['a']);
  });

  it('two roots on one container each replace what they added themselves', async () => {
    const container = new DigraphModel();
    const one = rootOn(container);
    const two = rootOn(container);
    await one.render(<Node id="a" />);
    await two.render(<Node id="b" />);
    await one.render(<Node id="c" />);
    expect(ids(container).sort()).toEqual(['b', 'c']);
    two.unmount();
    expect(ids(container)).toEqual(['c']);
    one.unmount();
    expect(container.nodes).toHaveLength(0);
  });
});

describe('two roots that render a node with the same id into one container', () => {
  const rootOn = (container: DigraphModel) => {
    let committed = (): void => {};
    const root = createRoot({
      container,
      onRenderComplete: () => committed(),
    });
    return {
      unmount: () => root.unmount(),
      render: (element: React.ReactElement) =>
        new Promise<void>((resolve) => {
          committed = resolve;
          root.render(element);
        }),
    };
  };
  const colorOf = (container: DigraphModel): unknown =>
    container.getNode('a')?.attributes.get('color');

  it('the container shows the node rendered last', async () => {
    const container = new DigraphModel();
    const one = rootOn(container);
    const two = rootOn(container);
    await one.render(<Node id="a" color="red" />);
    await two.render(<Node id="a" color="blue" />);
    expect(container.nodes).toHaveLength(1);
    expect(colorOf(container)).toBe('blue');
  });

  it('the node of the first comes back when the second is unmounted', async () => {
    const container = new DigraphModel();
    const one = rootOn(container);
    const two = rootOn(container);
    await one.render(<Node id="a" color="red" />);
    await two.render(<Node id="a" color="blue" />);
    two.unmount();
    expect(colorOf(container)).toBe('red');
    one.unmount();
    expect(container.nodes).toHaveLength(0);
  });

  it('the node of the first does not come back after the first was unmounted', async () => {
    const container = new DigraphModel();
    const one = rootOn(container);
    const two = rootOn(container);
    await one.render(<Node id="a" color="red" />);
    await two.render(<Node id="a" color="blue" />);
    one.unmount();
    expect(colorOf(container)).toBe('blue');
    two.unmount();
    expect(container.nodes).toHaveLength(0);
  });

  it('the node of the first does not come back after the first rendered another', async () => {
    const container = new DigraphModel();
    const one = rootOn(container);
    const two = rootOn(container);
    await one.render(<Node id="a" color="red" />);
    await two.render(<Node id="a" color="blue" />);
    await one.render(<Node id="c" />);
    two.unmount();
    expect(container.nodes.map((n) => n.id)).toEqual(['c']);
    one.unmount();
    expect(container.nodes).toHaveLength(0);
  });

  it("the container's own node comes back when both are unmounted, in either order", async () => {
    for (const firstGone of ['one', 'two'] as const) {
      const container = new DigraphModel();
      const own = new NodeModel('a', { color: 'green' });
      container.addNode(own);
      const roots = { one: rootOn(container), two: rootOn(container) };
      await roots.one.render(<Node id="a" color="red" />);
      await roots.two.render(<Node id="a" color="blue" />);
      roots[firstGone].unmount();
      roots[firstGone === 'one' ? 'two' : 'one'].unmount();
      expect(container.nodes).toEqual([own]);
    }
  });

  it('a node the container was given meanwhile is not replaced by an older one', async () => {
    const container = new DigraphModel();
    const one = rootOn(container);
    const two = rootOn(container);
    await one.render(<Node id="a" color="red" />);
    await two.render(<Node id="a" color="blue" />);
    const given = new NodeModel('a', { color: 'green' });
    container.addNode(given);
    two.unmount();
    one.unmount();
    expect(container.nodes).toEqual([given]);
  });

  it('the node of a finished conversion is what comes back, not what it replaced', async () => {
    const container = new DigraphModel();
    container.addNode(new NodeModel('a', { color: 'green' }));
    await fromElement(<Node id="a" color="red" />, { container });
    await fromElement(<Node id="a" color="blue" />, { container });
    const root = rootOn(container);
    await root.render(<Node id="a" color="black" />);
    expect(colorOf(container)).toBe('black');
    root.unmount();
    expect(colorOf(container)).toBe('blue');
  });

  it('the node of a conversion that finished over the node of a root stays when the root is unmounted', async () => {
    const container = new DigraphModel();
    container.addNode(new NodeModel('a', { color: 'green' }));
    const root = rootOn(container);
    await root.render(<Node id="a" color="black" />);
    await fromElement(<Node id="a" color="blue" />, { container });
    expect(colorOf(container)).toBe('blue');
    root.unmount();
    expect(colorOf(container)).toBe('blue');
    expect(container.nodes).toHaveLength(1);
  });

  it('a container that throws while a node comes back keeps the node it shows', async () => {
    let failing = false;
    class Failing extends DigraphModel {
      addNode(node: NodeModel): void {
        if (failing) throw new Error('addNode failed');
        super.addNode(node);
      }
    }
    const container = new Failing();
    const one = rootOn(container);
    const two = rootOn(container);
    await one.render(<Node id="a" color="red" />);
    await two.render(<Node id="a" color="blue" />);
    failing = true;
    two.unmount();
    failing = false;
    expect(colorOf(container)).toBe('blue');
    one.unmount();
    expect(colorOf(container)).toBe('blue');
    expect(container.nodes).toHaveLength(1);
  });
});
