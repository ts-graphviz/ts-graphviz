import React from 'react';
import { Digraph as DigraphModel } from 'ts-graphviz';
import { describe, expect, it, vi } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Edge } from './components/Edge.js';
import { Graph } from './components/Graph.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { useCurrentGraph } from './hooks/useCurrentGraph.js';
import { renderToDot } from './renderToDot.js';

const Thrower = (): React.ReactElement => {
  throw new Error('boom');
};
const errorCallbacks = () => {
  const calls: string[] = [];
  const record = (name: string) => (error: Error) => {
    calls.push(`${name}: ${error.message}`);
  };
  return {
    calls,
    options: {
      onUncaughtError: record('onUncaughtError'),
      onCaughtError: record('onCaughtError'),
      onRecoverableError: record('onRecoverableError'),
    },
  };
};

describe('renderToDot()', () => {
  describe('Without container', () => {
    it('renders a simple digraph to DOT', async () => {
      const dot = await renderToDot(
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
      const dot = await renderToDot(
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
      const dot = await renderToDot(
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
      const dot = await renderToDot(<Digraph id="empty" />);

      expect(dot).toContain('digraph "empty"');
      expect(dot).toContain('{}');
    });
  });

  describe('With container', () => {
    it('renders container with added elements to DOT', async () => {
      const container = new DigraphModel('container');

      const dot = await renderToDot(
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

      const dot = await renderToDot(
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

      const dot = await renderToDot(<React.Fragment />, { container });

      expect(dot).toContain('digraph "empty_container"');
      expect(dot).toContain('{}');
    });
  });

  describe('Error cases', () => {
    it('throws error for multiple top-level graphs', async () => {
      await expect(
        renderToDot(
          <>
            <Digraph id="graph1">
              <Node id="a" />
            </Digraph>
            <Graph id="graph2">
              <Node id="b" />
            </Graph>
          </>,
        ),
      ).rejects.toThrow(/Multiple top-level graphs detected/);
    });

    it('throws error when no top-level graph is provided', async () => {
      await expect(
        renderToDot(
          <>
            <Node id="orphan" />
            <Edge targets={['a', 'b']} />
          </>,
        ),
      ).rejects.toThrow(/No top-level graph found/);
    });

    it('throws error for fragment with multiple graphs', async () => {
      await expect(
        renderToDot(
          <React.Fragment>
            <Digraph id="graph1">
              <Node id="a" />
            </Digraph>
            <Digraph id="graph2">
              <Node id="b" />
            </Digraph>
          </React.Fragment>,
        ),
      ).rejects.toThrow(/Multiple top-level graphs detected/);
    });
  });

  describe('HTML-like labels', () => {
    it('renders graphs with HTML-like labels', async () => {
      const dot = await renderToDot(
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

  describe('props are read from their own properties', () => {
    it('renders the same DOT whatever Object.prototype holds', async () => {
      const element = (
        <Digraph id="G">
          <Node id="a" />
          <Edge targets={['a', 'b']} />
          <Subgraph id="s">
            <Node id="c" />
          </Subgraph>
        </Digraph>
      );
      const clean = await renderToDot(element);
      const proto = Object.prototype as Record<string, unknown>;
      const inherited = {
        label: 'extra',
        xlabel: 'extra',
        comment: 'extra',
        node: { shape: 'box' },
        edge: { color: 'red' },
        graph: { rankdir: 'LR' },
      };
      Object.assign(proto, inherited);
      let dot: string;
      try {
        dot = await renderToDot(element);
      } finally {
        for (const key of Object.keys(inherited)) delete proto[key];
      }
      expect(dot).toBe(clean);
    });

    it('does not read a keyed element key as a prop', async () => {
      const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
      try {
        await renderToDot(
          <Digraph id="G">
            {['a', 'b'].map((id) => (
              <Node key={id} id={id} />
            ))}
          </Digraph>,
        );
        expect(errors).not.toHaveBeenCalled();
      } finally {
        errors.mockRestore();
      }
    });

    it('renders with one reconciler per root without renderer warnings', async () => {
      const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
      try {
        for (const id of ['a', 'b', 'c']) {
          await renderToDot(
            <Digraph>
              <Node id={id} />
            </Digraph>,
          );
        }
        expect(errors).not.toHaveBeenCalled();
      } finally {
        errors.mockRestore();
      }
    });

    it('rejects a render that took longer than the timeout', async () => {
      const Slow = (): React.ReactElement => {
        const until = Date.now() + 30;
        while (Date.now() < until) {
          // Simulate synchronous rendering work.
        }
        return <Node id="slow" />;
      };
      await expect(
        renderToDot(
          <Digraph>
            <Slow />
          </Digraph>,
          { timeout: 10 },
        ),
      ).rejects.toThrow('Rendering timeout after 10ms');
    });
  });

  describe('Render completion', () => {
    it('reports a component that throws without a boundary, and rejects', async () => {
      const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
      try {
        const { calls, options } = errorCallbacks();
        await expect(
          renderToDot(
            <Digraph>
              <Thrower />
            </Digraph>,
            options,
          ),
        ).rejects.toThrow(/No top-level graph found/);
        expect(calls).toEqual(['onUncaughtError: boom']);
      } finally {
        errors.mockRestore();
      }
    });

    it('renders the fallback of a suspended tree', async () => {
      const Lazy = React.lazy(
        () =>
          new Promise<{ default: () => React.ReactElement }>(() => undefined),
      );
      const dot = await renderToDot(
        <Digraph>
          <React.Suspense fallback={<Node id="loading" />}>
            <Lazy />
          </React.Suspense>
        </Digraph>,
      );
      expect(dot).toContain('"loading"');
    });

    it('includes the work of effects in the output', async () => {
      const EffectNode = (): React.ReactElement => {
        const graph = useCurrentGraph();
        React.useEffect(() => {
          graph.createNode('from-effect');
        }, [graph]);
        return <Node id="a" />;
      };
      const EffectState = (): React.ReactElement => {
        const [id, setId] = React.useState('before');
        React.useEffect(() => setId('after'), []);
        return <Node id={id} />;
      };
      const dot = await renderToDot(
        <Digraph>
          <EffectNode />
          <EffectState />
        </Digraph>,
      );
      expect(dot).toContain('"from-effect"');
      expect(dot).toContain('"after"');
      expect(dot).not.toContain('"before"');
    });
  });
});
