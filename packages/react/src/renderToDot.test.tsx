import React from 'react';
import { Digraph as DigraphModel, toDot } from 'ts-graphviz';
import { describe, expect, it, vi } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Edge } from './components/Edge.js';
import { Graph } from './components/Graph.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { createRoot } from './createRoot.js';
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
  });

  describe('Deeply nested trees', () => {
    type Chain = { id: string; next?: Chain };
    const chainOf = (length: number): Chain => {
      let chain: Chain = { id: 'n0' };
      for (let i = 1; i < length; i++) {
        chain = { id: `n${i}`, next: chain };
      }
      return chain;
    };
    const Item = ({ chain }: { chain: Chain }): React.ReactElement => (
      <>
        <Node id={chain.id} />
        {chain.next && <Item chain={chain.next} />}
      </>
    );

    it('rejects a tree too deep for the stack, and later renders still work', async () => {
      await expect(
        renderToDot(
          <Digraph>
            <Item chain={chainOf(20_000)} />
          </Digraph>,
        ),
      ).rejects.toThrow(RangeError);

      const dot = await renderToDot(
        <Digraph id="after">
          <Node id="a" />
        </Digraph>,
      );
      expect(dot).toContain('digraph "after"');
      expect(dot).toContain('"a"');
    });

    it('keeps a failing render from breaking a root that is already mounted', async () => {
      const root = createRoot();
      try {
        await root.render(
          <Digraph id="kept">
            <Item chain={chainOf(3)} />
          </Digraph>,
        );

        await expect(
          renderToDot(
            <Digraph>
              <Item chain={chainOf(20_000)} />
            </Digraph>,
          ),
        ).rejects.toThrow(RangeError);

        await root.render(
          <Digraph id="kept">
            <Item chain={chainOf(4)} />
          </Digraph>,
        );
        const [graph] = root.getTopLevelModels();
        expect(toDot(graph)).toContain('"n3"');
      } finally {
        root.unmount();
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

  describe('Error callbacks', () => {
    class Boundary extends React.Component<
      { children: React.ReactNode },
      { failed: boolean }
    > {
      state = { failed: false };
      static getDerivedStateFromError() {
        return { failed: true };
      }
      render() {
        return this.state.failed ? <Node id="fallback" /> : this.props.children;
      }
    }
    // React calls these callbacks outside the returned promise: an error
    // they throw is unhandled, so watch for one while the render settles.
    const unhandledDuring = async (render: () => Promise<unknown>) => {
      const unhandled: unknown[] = [];
      const record = (error: unknown) => unhandled.push(error);
      process.on('uncaughtException', record);
      try {
        await render().catch(() => undefined);
        await new Promise((resolve) => setTimeout(resolve, 50));
      } finally {
        process.off('uncaughtException', record);
      }
      return unhandled;
    };
    const quietly = async (test: () => Promise<void>) => {
      const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
      try {
        await test();
      } finally {
        errors.mockRestore();
      }
    };
    const throwsOnce = () => {
      let thrown = false;
      return (): React.ReactElement => {
        if (!thrown) {
          thrown = true;
          throw new Error('once');
        }
        return <Node id="recovered" />;
      };
    };

    it('renders the fallback of an error boundary and calls onCaughtError', () =>
      quietly(async () => {
        const { calls, options } = errorCallbacks();
        const stacks: unknown[] = [];
        let dot = '';
        const unhandled = await unhandledDuring(async () => {
          dot = await renderToDot(
            <Digraph>
              <Boundary>
                <Thrower />
              </Boundary>
            </Digraph>,
            {
              ...options,
              onCaughtError: (error, errorInfo) => {
                stacks.push(errorInfo.componentStack);
                options.onCaughtError(error);
              },
            },
          );
        });
        expect(unhandled).toEqual([]);
        expect(dot).toContain('"fallback"');
        expect(calls).toEqual(['onCaughtError: boom']);
        expect(stacks).toEqual([expect.stringContaining('Thrower')]);
      }));

    it('renders the fallback of an error boundary without callbacks', () =>
      quietly(async () => {
        let dot = '';
        const unhandled = await unhandledDuring(async () => {
          dot = await renderToDot(
            <Digraph>
              <Boundary>
                <Thrower />
              </Boundary>
            </Digraph>,
          );
        });
        expect(unhandled).toEqual([]);
        expect(dot).toContain('"fallback"');
      }));

    it('rejects the render with an error that onCaughtError throws', () =>
      quietly(async () => {
        const failure = new Error('callback failed');
        let result: unknown;
        const unhandled = await unhandledDuring(() =>
          renderToDot(
            <Digraph>
              <Boundary>
                <Thrower />
              </Boundary>
            </Digraph>,
            {
              onCaughtError: () => {
                throw failure;
              },
            },
          ).catch((error) => {
            result = error;
          }),
        );
        expect(unhandled).toEqual([]);
        expect(result).toBe(failure);
      }));

    it('rejects every pending render of the root with an error a callback throws', () =>
      quietly(async () => {
        const failure = new Error('callback failed');
        const root = createRoot({
          onCaughtError: () => {
            throw failure;
          },
        });
        try {
          const Lazy = React.lazy(
            () =>
              new Promise<{ default: () => React.ReactElement }>(
                () => undefined,
              ),
          );
          // Suspends without a boundary, so it stays pending.
          const first = root.render(
            <Digraph>
              <Lazy />
            </Digraph>,
          );
          const second = root.render(
            <Digraph>
              <Boundary>
                <Thrower />
              </Boundary>
            </Digraph>,
          );
          const results = await Promise.allSettled([first, second]);
          expect(results).toEqual([
            { status: 'rejected', reason: failure },
            { status: 'rejected', reason: failure },
          ]);
        } finally {
          root.unmount();
        }
      }));

    it('calls onRecoverableError for an error React recovers from', async () => {
      const ThrowsOnce = throwsOnce();
      const { calls, options } = errorCallbacks();
      let dot = '';
      const unhandled = await unhandledDuring(async () => {
        dot = await renderToDot(
          <Digraph>
            <ThrowsOnce />
          </Digraph>,
          options,
        );
      });
      expect(unhandled).toEqual([]);
      expect(dot).toContain('"recovered"');
      expect(calls).toHaveLength(1);
      expect(calls[0]).toMatch(/^onRecoverableError: /);
    });

    it('recovers from an error without callbacks', async () => {
      const ThrowsOnce = throwsOnce();
      let dot = '';
      const unhandled = await unhandledDuring(async () => {
        dot = await renderToDot(
          <Digraph>
            <ThrowsOnce />
          </Digraph>,
        );
      });
      expect(unhandled).toEqual([]);
      expect(dot).toContain('"recovered"');
    });

    it('unmounts a tree whose effect cleanup throws', () =>
      quietly(async () => {
        const CleanupThrows = (): React.ReactElement => {
          React.useEffect(
            () => () => {
              throw new Error('cleanup');
            },
            [],
          );
          return <Node id="a" />;
        };
        const { calls, options } = errorCallbacks();
        let dot = '';
        const unhandled = await unhandledDuring(async () => {
          dot = await renderToDot(
            <Digraph>
              <CleanupThrows />
            </Digraph>,
            options,
          );
        });
        expect(unhandled).toEqual([]);
        expect(dot).toContain('"a"');
        expect(calls).toEqual(['onUncaughtError: cleanup']);
      }));
  });
});
