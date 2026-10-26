import {
  Component,
  createRef,
  Fragment,
  type ReactElement,
  type ReactNode,
  StrictMode,
  Suspense,
  use,
  useState,
} from 'react';
import {
  Digraph as DigraphModel,
  type EdgeModel,
  type NodeModel,
  type RootGraphModel,
  type SubgraphModel,
  toDot,
} from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Edge } from './components/Edge.js';
import { GraphPortal } from './components/GraphPortal.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { createRoot } from './createRoot.js';
import { useCurrentGraph } from './hooks/useCurrentGraph.js';
import { renderToDot } from './renderToDot.js';

async function dotOf(
  root: ReturnType<typeof createRoot>,
  element: ReactElement,
): Promise<string> {
  await root.render(element);
  const [graph] = root.getTopLevelModels();
  return toDot(graph as RootGraphModel);
}

describe('host components', () => {
  it('renders each statement once under StrictMode', async () => {
    const dot = await renderToDot(
      <StrictMode>
        <Digraph id="G">
          <Node id="a" />
          <Node id="b" />
          <Edge targets={['a', 'b']} />
        </Digraph>
      </StrictMode>,
    );
    expect(dot).toBe('digraph "G" {\n  "a";\n  "b";\n  "a" -> "b";\n}');
  });

  it('follows the element order when children are reordered', async () => {
    const root = createRoot();
    await dotOf(
      root,
      <Digraph id="G">
        <Node id="x" />
        <Node id="y" />
      </Digraph>,
    );
    expect(
      await dotOf(
        root,
        <Digraph id="G">
          <Node id="y" />
          <Node id="x" />
        </Digraph>,
      ),
    ).toBe('digraph "G" {\n  "y";\n  "x";\n}');
  });

  it('inserts, removes and moves keyed children in place', async () => {
    function List({ ids }: { ids: string[] }): ReactNode {
      return (
        <Digraph id="G">
          <Node id="first" />
          {ids.map((id) => (
            <Node key={id} id={id} />
          ))}
          <Node id="last" />
        </Digraph>
      );
    }
    const root = createRoot();
    const order = async (ids: string[]) => {
      await root.render(<List ids={ids} />);
      const [graph] = root.getTopLevelModels() as RootGraphModel[];
      return graph.nodes.map((n) => n.id);
    };
    expect(await order(['a', 'c'])).toEqual(['first', 'a', 'c', 'last']);
    expect(await order(['a', 'b', 'c'])).toEqual([
      'first',
      'a',
      'b',
      'c',
      'last',
    ]);
    expect(await order(['c', 'a'])).toEqual(['first', 'c', 'a', 'last']);
    expect(await order([])).toEqual(['first', 'last']);
  });

  it('keeps subgraphs and edges in element order, with conditional children', async () => {
    const root = createRoot();
    const element = (show: boolean) => (
      <Digraph id="G">
        <Node id="a" />
        {show && (
          <Subgraph id="cluster_x">
            <Node id="b" />
          </Subgraph>
        )}
        <Edge targets={['a', 'b']} />
        {show ? <Node id="c" /> : null}
      </Digraph>
    );
    expect(await dotOf(root, element(false))).toBe(
      'digraph "G" {\n  "a";\n  "a" -> "b";\n}',
    );
    expect(await dotOf(root, element(true))).toBe(
      'digraph "G" {\n  "a";\n  subgraph "cluster_x" {\n    "b";\n  }\n  "a" -> "b";\n  "c";\n}',
    );
    expect(await dotOf(root, element(false))).toBe(
      'digraph "G" {\n  "a";\n  "a" -> "b";\n}',
    );
  });

  it('flattens fragments and arrays in order', async () => {
    const dot = await renderToDot(
      <Digraph id="G">
        {/* biome-ignore lint/complexity/noUselessFragments: the case is about fragments */}
        <Fragment>
          <Node id="a" />
          {[<Node key="b" id="b" />, [<Node key="c" id="c" />]]}
        </Fragment>
        <Node id="d" />
      </Digraph>,
    );
    expect(dot).toBe('digraph "G" {\n  "a";\n  "b";\n  "c";\n  "d";\n}');
  });

  it('resolves refs to the models, keeps them across updates, and clears them on unmount', async () => {
    const graph = createRef<RootGraphModel>();
    const subgraph = createRef<SubgraphModel>();
    const node = createRef<NodeModel>();
    const edge = createRef<EdgeModel>();
    const element = (color: string) => (
      <Digraph id="G" ref={graph}>
        <Subgraph id="s" ref={subgraph}>
          <Node id="a" ref={node} color={color} />
        </Subgraph>
        <Edge targets={['a', 'b']} ref={edge} color={color} />
      </Digraph>
    );
    const root = createRoot();
    await root.render(element('red'));
    const [model] = root.getTopLevelModels() as RootGraphModel[];
    expect(graph.current).toBe(model);
    expect(subgraph.current).toBe(model.subgraphs[0]);
    expect(node.current).toBe(model.subgraphs[0].getNode('a'));
    expect(edge.current).toBe(model.edges[0]);
    const first = { node: node.current, edge: edge.current };

    await root.render(element('blue'));
    expect(node.current).toBe(first.node);
    expect(edge.current).toBe(first.edge);
    expect(node.current?.attributes.get('color')).toBe('blue');

    root.unmount();
    expect(graph.current).toBeNull();
    expect(node.current).toBeNull();
  });

  it('replaces a node whose id changes, and the ref follows it', async () => {
    const node = createRef<NodeModel>();
    const root = createRoot();
    await root.render(
      <Digraph id="G">
        <Node id="a" ref={node} />
      </Digraph>,
    );
    const before = node.current;
    expect(
      await dotOf(
        root,
        <Digraph id="G">
          <Node id="b" ref={node} />
        </Digraph>,
      ),
    ).toBe('digraph "G" {\n  "b";\n}');
    expect(node.current).not.toBe(before);
    expect(node.current?.id).toBe('b');
  });

  it('replaces an edge whose targets change', async () => {
    const root = createRoot();
    await dotOf(
      root,
      <Digraph id="G">
        <Edge targets={['a', 'b']} />
      </Digraph>,
    );
    expect(
      await dotOf(
        root,
        <Digraph id="G">
          <Edge targets={['a', 'c']} />
        </Digraph>,
      ),
    ).toBe('digraph "G" {\n  "a" -> "c";\n}');
  });

  it('clears an attribute whose prop is removed', async () => {
    const root = createRoot();
    await dotOf(
      root,
      <Digraph id="G" rankdir="LR" node={{ shape: 'box' }}>
        <Node id="a" color="red" comment="note" />
      </Digraph>,
    );
    expect(
      await dotOf(
        root,
        <Digraph id="G">
          <Node id="a" />
        </Digraph>,
      ),
    ).toBe('digraph "G" {\n  "a";\n}');
  });

  it('applies state updates', async () => {
    let setColor: (color: string) => void = () => {};
    function Colored(): ReactNode {
      const [color, set] = useState('red');
      setColor = set;
      return <Node id="a" color={color} />;
    }
    const root = createRoot();
    await root.render(
      <Digraph id="G">
        <Colored />
      </Digraph>,
    );
    setColor('blue');
    await root.render(
      <Digraph id="G">
        <Colored />
      </Digraph>,
    );
    const [graph] = root.getTopLevelModels() as RootGraphModel[];
    expect(graph.getNode('a')?.attributes.get('color')).toBe('blue');
  });

  it('leaves nothing behind from a render that suspended', async () => {
    let resolve: (value: string) => void = () => {};
    const data = new Promise<string>((r) => {
      resolve = r;
    });
    function Late(): ReactNode {
      return <Node id={use(data)} />;
    }
    setTimeout(() => resolve('late'), 10);
    const dot = await renderToDot(
      <Digraph id="G">
        <Suspense fallback={<Node id="loading" />}>
          <Node id="early" />
          <Late />
        </Suspense>
      </Digraph>,
    );
    expect(dot).toBe('digraph "G" {\n  "early";\n  "late";\n}');
  });

  it('adds the children of a GraphPortal to a subgraph rendered in the same tree', async () => {
    const dot = await renderToDot(
      <Digraph id="G">
        <Subgraph id="cluster_target">
          <Node id="inside" />
        </Subgraph>
        <GraphPortal id="cluster_target">
          <Node id="ported" />
        </GraphPortal>
        <Node id="outside" />
      </Digraph>,
    );
    expect(dot).toBe(
      'digraph "G" {\n  subgraph "cluster_target" {\n    "inside";\n    "ported";\n  }\n  "outside";\n}',
    );
  });

  it('gives useCurrentGraph the enclosing graph during render', async () => {
    const seen: string[] = [];
    function Probe(): ReactNode {
      seen.push(useCurrentGraph().id ?? '');
      return null;
    }
    await renderToDot(
      <Digraph id="G">
        <Probe />
        <Subgraph id="s">
          <Probe />
        </Subgraph>
      </Digraph>,
    );
    expect(seen).toEqual(['G', 's']);
  });

  it('keeps the statements a container already had, and replaces only its own', async () => {
    const container = new DigraphModel('C');
    container.createNode('existing');
    const root = createRoot({ container });
    await root.render(
      <>
        <Node id="a" />
        <Node id="b" />
      </>,
    );
    expect(container.nodes.map((n) => n.id)).toEqual(['existing', 'a', 'b']);
    await root.render(<Node id="b" />);
    expect(container.nodes.map((n) => n.id)).toEqual(['existing', 'b']);
    root.unmount();
    expect(container.nodes.map((n) => n.id)).toEqual(['existing']);
  });

  it('gives back a node the container had when one with its id is removed', async () => {
    const container = new DigraphModel('C');
    container.createNode('a', { color: 'red' });
    const original = container.getNode('a');
    const root = createRoot({ container });
    await root.render(<Node id="a" color="blue" />);
    expect(container.getNode('a')?.attributes.get('color')).toBe('blue');
    root.unmount();
    expect(container.getNode('a')).toBe(original);
    expect(original?.attributes.get('color')).toBe('red');
  });

  it('adds portal children to a subgraph the container had', async () => {
    const container = new DigraphModel('C');
    const target = container.createSubgraph('cluster_t');
    target.createNode('own');
    const root = createRoot({ container });
    await root.render(
      <GraphPortal id="cluster_t">
        <Node id="ported" />
      </GraphPortal>,
    );
    expect(target.nodes.map((n) => n.id)).toEqual(['own', 'ported']);
    root.unmount();
    expect(target.nodes.map((n) => n.id)).toEqual(['own']);
  });

  it('never puts a graph inside itself through a portal', async () => {
    const root = createRoot();
    const element = (
      <Digraph id="G">
        <GraphPortal id="s">
          <Subgraph id="s">
            <Node id="a" />
          </Subgraph>
        </GraphPortal>
      </Digraph>
    );
    const expected = 'digraph "G" {\n  subgraph "s" {\n    "a";\n  }\n}';
    expect(await dotOf(root, element)).toBe(expected);
    expect(await dotOf(root, element)).toBe(expected);
  });

  it('adds the children of nested portals in element order', async () => {
    const dot = await renderToDot(
      <Digraph id="G">
        <Subgraph id="t" />
        <GraphPortal id="t">
          <Node id="a" />
          <GraphPortal id="t">
            <Node id="b" />
          </GraphPortal>
        </GraphPortal>
        <GraphPortal id="t">
          <Node id="c" />
        </GraphPortal>
      </Digraph>,
    );
    expect(dot).toBe(
      'digraph "G" {\n  subgraph "t" {\n    "a";\n    "b";\n    "c";\n  }\n}',
    );
  });

  it('finds a portal target rendered after the portal', async () => {
    const dot = await renderToDot(
      <Digraph id="G">
        <GraphPortal id="t">
          <Node id="a" />
        </GraphPortal>
        <Subgraph id="t" />
      </Digraph>,
    );
    expect(dot).toBe('digraph "G" {\n  subgraph "t" {\n    "a";\n  }\n}');
  });

  it('points a graph ref at the model its children are in', async () => {
    const graph = createRef<RootGraphModel>();
    const root = createRoot();
    await root.render(
      <Digraph id="G" ref={graph}>
        <Node id="a" />
      </Digraph>,
    );
    const [first] = root.getTopLevelModels() as RootGraphModel[];
    expect(graph.current).toBe(first);
    expect(first.getNode('a')).toBeDefined();
  });

  it("makes subgraphs with the enclosing graph's createSubgraph", async () => {
    const made: unknown[] = [];
    const container = new DigraphModel('C');
    const createSubgraph = container.createSubgraph.bind(container);
    container.createSubgraph = ((id?: string) => {
      const subgraph = createSubgraph(id);
      made.push(subgraph);
      return subgraph;
    }) as typeof container.createSubgraph;
    const root = createRoot({ container });
    await root.render(<Subgraph id="s" />);
    expect(container.subgraphs).toHaveLength(1);
    expect(made).toContain(container.subgraphs[0]);
  });

  it('rejects a node in a portal outside any graph', async () => {
    await expect(
      renderToDot(
        <GraphPortal>
          <Node id="a" />
        </GraphPortal>,
      ),
    ).rejects.toThrow(
      /<Node> must be rendered inside a Digraph, Graph or Subgraph/,
    );
  });

  it('reports an invalid label to the error boundary, during render', async () => {
    class Boundary extends Component<
      { children: ReactNode },
      { failed: boolean }
    > {
      override state = { failed: false };
      static getDerivedStateFromError() {
        return { failed: true };
      }
      override render() {
        return this.state.failed ? <Node id="fallback" /> : this.props.children;
      }
    }
    const caught: unknown[] = [];
    const root = createRoot({ onCaughtError: (error) => caught.push(error) });
    const element = (label: ReactElement | string) => (
      <Digraph id="G">
        <Boundary>
          <Node id="a" label={label} />
        </Boundary>
      </Digraph>
    );
    expect(await dotOf(root, element(<div />))).toBe(
      'digraph "G" {\n  "fallback";\n}',
    );
    expect(caught).toHaveLength(1);
    expect(caught[0]).toBeInstanceOf(TypeError);

    const updated = createRoot({
      onCaughtError: (error) => caught.push(error),
    });
    await updated.render(element('ok'));
    await updated.render(element(<div />));
    expect(caught).toHaveLength(2);
  });

  it('rejects render() with an error a graph throws while adding models, and can still unmount', async () => {
    const container = new DigraphModel('C');
    container.createNode = () => {
      throw new RangeError('no nodes here');
    };
    const root = createRoot({ container });
    await expect(root.render(<Node id="a" />)).rejects.toThrow('no nodes here');
    root.unmount();
  });

  it('takes back what a factory added before it threw', async () => {
    const container = new DigraphModel('C');
    const createNode = container.createNode.bind(container);
    const createEdge = container.createEdge.bind(container);
    container.createNode = ((id: string) => {
      createNode(id);
      throw new RangeError('after adding');
    }) as typeof container.createNode;
    const nodes = createRoot({ container });
    await expect(nodes.render(<Node id="a" />)).rejects.toThrow('after adding');
    expect(container.nodes).toHaveLength(0);
    nodes.unmount();

    container.createNode = createNode;
    container.createEdge = ((targets: never) => {
      createEdge(targets);
      throw new RangeError('after adding');
    }) as typeof container.createEdge;
    const edges = createRoot({ container });
    await expect(edges.render(<Edge targets={['a', 'b']} />)).rejects.toThrow(
      'after adding',
    );
    expect(container.edges).toHaveLength(0);
    edges.unmount();
  });

  it('rejects a node outside any graph', async () => {
    await expect(renderToDot(<Node id="a" />)).rejects.toThrow(
      /<Node> must be rendered inside a Digraph, Graph or Subgraph/,
    );
  });
});
