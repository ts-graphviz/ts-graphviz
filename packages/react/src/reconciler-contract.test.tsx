import {
  act,
  Component,
  createContext,
  type ReactNode,
  Suspense,
  startTransition,
  use,
  useDeferredValue,
  useEffect,
  useState,
} from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import {
  DefaultEventPriority,
  DiscreteEventPriority,
  NoEventPriority,
} from 'react-reconciler/constants.js';
import { Digraph as DigraphModel, type RootGraphModel } from 'ts-graphviz';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { createRoot } from './createRoot.js';
import { fromElement } from './fromElement.js';
import { createRootContainer, HostConfig } from './reconciler.js';
import { elementToDot, render, uncaughtDuring } from './test-utils/render.js';

// The renderer against its contract with React 19: where errors go, when a
// render is done, and what a root and a one-time conversion promise.

class Boundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Thrower(): ReactNode {
  throw new RangeError('boom');
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('error callbacks', () => {
  it('lets an error boundary inside the tree catch, and reports it to onCaughtError', async () => {
    const onCaughtError = vi.fn();
    const onUncaughtError = vi.fn();
    const root = createRoot({ onCaughtError, onUncaughtError });
    await render(
      root,
      <Digraph id="G">
        <Boundary fallback={<Node id="fallback" />}>
          <Thrower />
        </Boundary>
      </Digraph>,
    );
    expect(onCaughtError).toHaveBeenCalledOnce();
    expect(onCaughtError.mock.calls[0][0]).toBeInstanceOf(RangeError);
    expect(onUncaughtError).not.toHaveBeenCalled();
    const [graph] = root.getTopLevelModels();
    expect(graph.$$type === 'Graph' && graph.nodes.map((n) => n.id)).toEqual([
      'fallback',
    ]);
  });

  it('reports an uncaught error to onUncaughtError, and the root has no models', async () => {
    const onUncaughtError = vi.fn();
    const onRenderComplete = vi.fn();
    const root = createRoot({ onUncaughtError, onRenderComplete });
    expect(
      root.render(
        <Digraph id="G">
          <Thrower />
        </Digraph>,
      ),
    ).toBeUndefined();
    await vi.waitFor(() => expect(onUncaughtError).toHaveBeenCalledOnce());
    expect(onUncaughtError.mock.calls[0][0]).toBeInstanceOf(RangeError);
    expect(onUncaughtError.mock.calls[0][1]).toEqual({
      componentStack: expect.stringContaining('Thrower'),
    });
    expect(onRenderComplete).not.toHaveBeenCalled();
    expect(root.getTopLevelModels()).toEqual([]);

    // The root renders again.
    await render(
      root,
      <Digraph id="G">
        <Node id="after" />
      </Digraph>,
    );
    expect(onRenderComplete).toHaveBeenCalledOnce();
    expect(root.getTopLevelModels()).toHaveLength(1);
    root.unmount();
  });

  it('rejects fromElement with an uncaught error', async () => {
    const container = new DigraphModel('C');
    await expect(
      fromElement(
        <>
          <Node id="a" />
          <Thrower />
        </>,
        { container },
      ),
    ).rejects.toThrow(RangeError);
    expect(container.nodes).toHaveLength(0);
  });

  it('throws what a callback of a root throws outside the render, and goes on', async () => {
    const root = createRoot({
      onCaughtError: () => {
        throw new TypeError('from the callback');
      },
    });
    const uncaught = await uncaughtDuring(async () => {
      root.render(
        <Digraph id="G">
          <Boundary fallback={<Node id="fallback" />}>
            <Thrower />
          </Boundary>
        </Digraph>,
      );
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    expect(uncaught.map(String)).toEqual(['TypeError: from the callback']);
    const [graph] = root.getTopLevelModels();
    expect(graph.$$type === 'Graph' && graph.nodes.map((n) => n.id)).toEqual([
      'fallback',
    ]);
    root.unmount();
  });

  it('rejects fromElement with what a callback throws, leaving nothing behind', async () => {
    const container = new DigraphModel('C');
    const uncaught = await uncaughtDuring(async () => {
      await expect(
        fromElement(
          <Boundary fallback={<Node id="fallback" />}>
            <Thrower />
          </Boundary>,
          {
            container,
            onCaughtError: () => {
              throw new TypeError('from the callback');
            },
          },
        ),
      ).rejects.toThrow('from the callback');
    });
    expect(uncaught).toEqual([]);
    expect(container.nodes).toHaveLength(0);
  });

  it('passes each callback in its own createContainer position', () => {
    const createContainer = vi.fn();
    const callbacks = {
      onUncaughtError: vi.fn(),
      onCaughtError: vi.fn(),
      onRecoverableError: vi.fn(),
    };
    createRootContainer({ createContainer }, {} as never, callbacks);
    const args = createContainer.mock.calls[0];
    expect(args[1]).toBe(1);
    expect(args[6]).toBe(callbacks.onUncaughtError);
    expect(args[7]).toBe(callbacks.onCaughtError);
    expect(args[8]).toBe(callbacks.onRecoverableError);
  });

  it('gets a recoverable error through the position React reports it in', async () => {
    // A component that throws on its first try only: React renders again
    // by itself and reports what it recovered from.
    let tries = 0;
    function Flaky(): ReactNode {
      const deferred = useDeferredValue('ready', 'first');
      if (deferred === 'ready' && tries++ === 0) throw new RangeError('once');
      return <Node id={deferred} />;
    }
    const onRecoverableError = vi.fn();
    const onUncaughtError = vi.fn();
    const dot = await elementToDot(
      <Digraph id="G">
        <Flaky />
      </Digraph>,
      { onRecoverableError },
    );
    expect(dot).toContain('"ready";');
    expect(onUncaughtError).not.toHaveBeenCalled();
    // React's own error, with what the component threw as its cause.
    expect(onRecoverableError).toHaveBeenCalledOnce();
    expect(onRecoverableError.mock.calls[0][0].cause).toMatchObject({
      name: 'RangeError',
      message: 'once',
    });
  });
});

describe('host config', () => {
  it('runs every update at the discrete (synchronous) priority', () => {
    const host = new HostConfig();
    expect(host.getCurrentUpdatePriority()).toBe(NoEventPriority);
    expect(host.resolveUpdatePriority()).toBe(DiscreteEventPriority);
    // React lowers the priority to the default one around passive effects;
    // their updates still run synchronously.
    host.setCurrentUpdatePriority(DefaultEventPriority);
    expect(host.getCurrentUpdatePriority()).toBe(DiscreteEventPriority);
    host.setCurrentUpdatePriority(NoEventPriority);
    expect(host.getCurrentUpdatePriority()).toBe(NoEventPriority);
  });

  it('runs a scheduled microtask as a microtask, not at once', async () => {
    const host = new HostConfig();
    const fn = vi.fn();
    host.scheduleMicrotask(fn);
    expect(fn).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('rejects an element it does not render, by its string type', () => {
    const host = new HostConfig();
    expect(() =>
      host.createInstance(
        'dot:td',
        {},
        {} as never,
        { inGraph: true },
        {} as never,
      ),
    ).toThrow('<dot:td> can only be used in an HTML-like label.');
  });
});

describe('synchronous rendering', () => {
  it('renders without waiting for timers', async () => {
    vi.useFakeTimers();
    const dot = await elementToDot(
      <Digraph id="G">
        <Node id="a" />
      </Digraph>,
    );
    expect(dot).toContain('"a";');
  });
});

describe('updates scheduled by effects', () => {
  function RevealedGraph(): ReactNode {
    const [shown, setShown] = useState(false);
    useEffect(() => setShown(true), []);
    return shown ? (
      <Digraph id="G">
        <Node id="late" />
      </Digraph>
    ) : null;
  }

  function RevealedNode(): ReactNode {
    const [shown, setShown] = useState(false);
    useEffect(() => setShown(true), []);
    return shown ? <Node id="late" /> : null;
  }

  function ThrowsAfterEffect(): ReactNode {
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(true), []);
    if (failed) throw new RangeError('after effect');
    return null;
  }

  it('settles before render resolves: a graph shown by an effect is there', async () => {
    const dot = await elementToDot(<RevealedGraph />);
    expect(dot).toContain('"late";');
  });

  it('settles before render resolves: a node shown by an effect is there', async () => {
    const dot = await elementToDot(
      <Digraph id="G">
        <RevealedNode />
      </Digraph>,
    );
    expect(dot).toContain('"late";');
  });

  it('rejects with an error thrown by a render an effect caused', async () => {
    await expect(
      elementToDot(
        <Digraph id="G">
          <ThrowsAfterEffect />
        </Digraph>,
      ),
    ).rejects.toThrow('after effect');
  });
});

describe('updates outside the synchronous lane', () => {
  function RevealedInTransition(): ReactNode {
    const [shown, setShown] = useState(false);
    useEffect(() => startTransition(() => setShown(true)), []);
    return shown ? <Node id="transition" /> : null;
  }

  function Deferred(): ReactNode {
    const shown = useDeferredValue(true, false);
    return shown ? <Node id="deferred" /> : null;
  }

  it('waits for a transition an effect started', async () => {
    const dot = await elementToDot(
      <Digraph id="G">
        <RevealedInTransition />
      </Digraph>,
    );
    expect(dot).toContain('"transition";');
  });

  it('waits for the final value of a deferred value', async () => {
    const dot = await elementToDot(
      <Digraph id="G">
        <Deferred />
      </Digraph>,
    );
    expect(dot).toContain('"deferred";');
  });

  it('waits for suspended data', async () => {
    const data = new Promise<string>((resolve) =>
      setTimeout(() => resolve('loaded'), 10),
    );
    function Loaded(): ReactNode {
      return <Node id={use(data)} />;
    }
    const dot = await elementToDot(
      <Digraph id="G">
        <Suspense fallback={<Node id="loading" />}>
          <Loaded />
        </Suspense>
      </Digraph>,
    );
    expect(dot).toContain('"loaded";');
    expect(dot).not.toContain('"loading";');
  });

  it('stops waiting when the signal aborts, with its reason, and leaves nothing behind', async () => {
    const never = new Promise<string>(() => {});
    function Forever(): ReactNode {
      return <Node id={use(never)} />;
    }
    const cleanup = vi.fn();
    function Mounted(): ReactNode {
      useEffect(() => cleanup, []);
      return <Node id="mounted" />;
    }
    const element = (
      <>
        <Mounted />
        <Suspense fallback={<Node id="loading" />}>
          <Forever />
        </Suspense>
      </>
    );
    const container = new DigraphModel('C');
    await expect(
      fromElement(element, { container, signal: AbortSignal.timeout(50) }),
    ).rejects.toMatchObject({ name: 'TimeoutError' });
    expect(container.nodes).toHaveLength(0);
    expect(cleanup).toHaveBeenCalledOnce();

    const controller = new AbortController();
    const pending = fromElement(element, {
      container,
      signal: controller.signal,
    });
    controller.abort(new RangeError('stop'));
    await expect(pending).rejects.toThrow('stop');
    expect(container.nodes).toHaveLength(0);
  });

  it('notices an abort during a render that settles synchronously', async () => {
    const controller = new AbortController();
    function AbortsInEffect(): ReactNode {
      useEffect(() => controller.abort(new RangeError('in effect')), []);
      return <Node id="a" />;
    }
    await expect(
      elementToDot(
        <Digraph id="G">
          <AbortsInEffect />
        </Digraph>,
        { signal: controller.signal },
      ),
    ).rejects.toThrow('in effect');
  });

  it('does not render when the signal has already aborted', async () => {
    const rendered = vi.fn();
    function Rendered(): ReactNode {
      rendered();
      return <Node id="a" />;
    }
    const container = new DigraphModel('C');
    await expect(
      fromElement(<Rendered />, {
        container,
        signal: AbortSignal.abort(new RangeError('before')),
      }),
    ).rejects.toThrow('before');
    expect(rendered).not.toHaveBeenCalled();
    expect(container.nodes).toHaveLength(0);
  });
});

describe('fromElement', () => {
  it('unmounts the tree when the models are ready, and the models stay', async () => {
    const cleanup = vi.fn();
    function Mounted(): ReactNode {
      useEffect(() => cleanup, []);
      return <Node id="a" />;
    }
    const container = new DigraphModel('C');
    const result = await fromElement(<Mounted />, { container });
    expect(result).toBe(container);
    expect(cleanup).toHaveBeenCalledOnce();
    expect(container.nodes.map((n) => n.id)).toEqual(['a']);
  });

  it('rejects with what a cleanup throws when the tree is unmounted, leaving nothing behind', async () => {
    function Mounted(): ReactNode {
      useEffect(
        () => () => {
          throw new RangeError('thrown by a cleanup');
        },
        [],
      );
      return <Node id="a" />;
    }
    const container = new DigraphModel('C');
    await expect(fromElement(<Mounted />, { container })).rejects.toThrow(
      'thrown by a cleanup',
    );
    expect(container.nodes).toHaveLength(0);
  });

  it('rejects when the top level has something other than a root graph and there is no container', async () => {
    function Reveals(): ReactNode {
      const [shown, setShown] = useState(false);
      useEffect(() => setShown(true), []);
      return shown ? <Subgraph id="s" /> : null;
    }
    const rejection = expect(
      fromElement(
        <>
          <Digraph id="G" />
          <Reveals />
        </>,
      ),
    ).rejects;
    await rejection.toBeInstanceOf(TypeError);
    await rejection.toThrow(
      'Without a container, the element must have only <Digraph> or <Graph> at its top level.',
    );
  });

  it('converts elements at the same time, each with its own models', async () => {
    function Slow({ id, ms }: { id: string; ms: number }): ReactNode {
      const [shown, setShown] = useState(false);
      useEffect(() => {
        const timer = setTimeout(
          () => startTransition(() => setShown(true)),
          ms,
        );
        return () => clearTimeout(timer);
      }, [ms]);
      return (
        <Digraph id={id}>
          <Node id={shown ? `${id}-late` : `${id}-first`} />
        </Digraph>
      );
    }
    const dots = await Promise.all(
      ['a', 'b', 'c'].map((id) =>
        elementToDot(
          <Digraph id={id}>
            <Suspense>
              <Node id={`${id}-node`} />
            </Suspense>
          </Digraph>,
        ),
      ),
    );
    expect(dots).toEqual(
      ['a', 'b', 'c'].map((id) => `digraph "${id}" {\n  "${id}-node";\n}`),
    );
    // What an effect starts by itself is not waited for.
    await expect(elementToDot(<Slow id="s" ms={5} />)).resolves.toContain(
      '"s-first";',
    );
  });
});

describe('renders on one root', () => {
  function Late({ id }: { id: string }): ReactNode {
    const [shown, setShown] = useState(false);
    useEffect(() => setShown(true), []);
    return shown ? <Node id={id} /> : null;
  }

  const nodeIds = (models: readonly { $$type: string }[]): string[] =>
    (models as RootGraphModel[]).flatMap((m) => m.nodes.map((n) => n.id));

  it('does not render before render() returns', async () => {
    const rendered = vi.fn();
    function Rendered(): ReactNode {
      rendered();
      return <Digraph id="G" />;
    }
    const root = createRoot();
    root.render(<Rendered />);
    expect(rendered).not.toHaveBeenCalled();
    expect(root.getTopLevelModels()).toEqual([]);
    await vi.waitFor(() => expect(root.getTopLevelModels()).toHaveLength(1));
    root.unmount();
  });

  it('calls onRenderComplete once for renders in a row, with the last tree', async () => {
    const seen: string[][] = [];
    const root = createRoot({
      onRenderComplete: (models) => seen.push(nodeIds(models)),
    });
    root.render(
      <Digraph id="G">
        <Late id="first" />
      </Digraph>,
    );
    root.render(
      <Digraph id="G">
        <Late id="second" />
      </Digraph>,
    );
    await vi.waitFor(() => expect(seen).toHaveLength(1));
    await new Promise((resolve) => setTimeout(resolve, 10));
    // The update the effect scheduled is in it.
    expect(seen).toEqual([['second']]);
    root.unmount();
  });

  it('calls onRenderComplete again when the tree updates by itself', async () => {
    const seen: string[][] = [];
    let reveal!: () => void;
    function Updating(): ReactNode {
      const [shown, setShown] = useState(false);
      reveal = () => setShown(true);
      return <Node id={shown ? 'updated' : 'first'} />;
    }
    const root = createRoot({
      onRenderComplete: (models) => seen.push(nodeIds(models)),
    });
    await render(
      root,
      <Digraph id="G">
        <Updating />
      </Digraph>,
    );
    reveal();
    await vi.waitFor(() => expect(seen).toEqual([['first'], ['updated']]));
    root.unmount();
  });

  it('completes a render that follows a tree suspended as a whole, whose error is reported late', async () => {
    const never = new Promise<string>(() => undefined);
    function Forever(): ReactNode {
      return <Node id={use(never)} />;
    }
    const events: string[] = [];
    const root = createRoot({
      onUncaughtError: (error) => events.push(String(error)),
      onRenderComplete: (models) => events.push(nodeIds(models).join()),
    });
    // No Suspense boundary: React commits nothing and waits.
    root.render(
      <Digraph id="G">
        <Forever />
        <Thrower />
      </Digraph>,
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(events).toEqual([]);
    expect(root.getTopLevelModels()).toEqual([]);

    root.render(
      <Digraph id="G">
        <Node id="next" />
      </Digraph>,
    );
    await vi.waitFor(() => expect(events).toContain('next'));
    expect(events).toEqual(['RangeError: boom', 'next']);
    root.unmount();
  });

  it('tells nothing more after unmount(), takes its models out, and refuses to render', async () => {
    const onRenderComplete = vi.fn();
    const onUncaughtError = vi.fn();
    const container = new DigraphModel('C');
    const root = createRoot({ container, onRenderComplete, onUncaughtError });
    await render(root, <Node id="a" />);
    expect(container.nodes).toHaveLength(1);
    onRenderComplete.mockClear();

    root.render(<Thrower />);
    root.unmount();
    root.unmount();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(onRenderComplete).not.toHaveBeenCalled();
    expect(onUncaughtError).not.toHaveBeenCalled();
    expect(container.nodes).toHaveLength(0);
    expect(root.getTopLevelModels()).toEqual([]);
    expect(() => root.render(<Node id="b" />)).toThrow(
      'Cannot render on an unmounted root',
    );
  });
});

describe('unmount() of a root', () => {
  it('reports what a cleanup throws to onUncaughtError', async () => {
    function Mounted(): ReactNode {
      useEffect(
        () => () => {
          throw new RangeError('thrown by a cleanup');
        },
        [],
      );
      return <Node id="a" />;
    }
    const onUncaughtError = vi.fn();
    const container = new DigraphModel('C');
    const root = createRoot({ container, onUncaughtError });
    await render(root, <Mounted />);
    root.unmount();
    expect(onUncaughtError.mock.calls.map(([error]) => String(error))).toEqual([
      'RangeError: thrown by a cleanup',
    ]);
    expect(container.nodes).toHaveLength(0);
  });
});

describe('React.act', () => {
  const environment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  afterEach(() => {
    environment.IS_REACT_ACT_ENVIRONMENT = undefined;
  });

  function Late(): ReactNode {
    const [id, setId] = useState('first');
    useEffect(() => setId('late'), []);
    return <Node id={id} />;
  }

  it('flushes a render and its effects before a synchronous act() returns', async () => {
    environment.IS_REACT_ACT_ENVIRONMENT = true;
    const onRenderComplete = vi.fn();
    const root = createRoot({ onRenderComplete });
    act(() => {
      root.render(
        <Digraph id="G">
          <Late />
        </Digraph>,
      );
    });
    const [graph] = root.getTopLevelModels();
    expect(graph.$$type === 'Graph' && graph.nodes.map((n) => n.id)).toEqual([
      'late',
    ]);
    // The callback is called outside React's work, a microtask later.
    expect(onRenderComplete).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(onRenderComplete).toHaveBeenCalledOnce();
    root.unmount();
  });

  it('flushes updates of the tree made inside act()', async () => {
    environment.IS_REACT_ACT_ENVIRONMENT = true;
    let setId!: (id: string) => void;
    function Stateful(): ReactNode {
      const [id, set] = useState('first');
      setId = set;
      return <Node id={id} />;
    }
    const root = createRoot();
    await act(async () => {
      root.render(
        <Digraph id="G">
          <Stateful />
        </Digraph>,
      );
    });
    act(() => setId('second'));
    const [graph] = root.getTopLevelModels();
    expect(graph.$$type === 'Graph' && graph.nodes.map((n) => n.id)).toEqual([
      'second',
    ]);
    root.unmount();
  });

  it('throws an uncaught error from act(), as React does for its own roots', async () => {
    environment.IS_REACT_ACT_ENVIRONMENT = true;
    const onUncaughtError = vi.fn();
    const root = createRoot({ onUncaughtError });
    expect(() =>
      act(() => {
        root.render(
          <Digraph id="G">
            <Thrower />
          </Digraph>,
        );
      }),
    ).toThrow(RangeError);
    expect(onUncaughtError).not.toHaveBeenCalled();
    expect(root.getTopLevelModels()).toEqual([]);
    root.unmount();
  });
});

describe('next to another renderer', () => {
  const Theme = createContext('default');

  it('keeps its context values apart from those of React DOM', async () => {
    // React keeps a context's value in one slot for the primary renderer
    // (React DOM) and in another for the rest. In the same slot, a tree of
    // this renderer rendered while React DOM is inside a provider would
    // read React DOM's value.
    function Reads(): ReactNode {
      return <Node id={use(Theme)} />;
    }
    let converted: Promise<string> | undefined;
    function RenderedByReactDom(): ReactNode {
      // The conversion renders at once, in the middle of React DOM's work.
      converted ??= elementToDot(
        <Digraph id="G">
          <Reads />
        </Digraph>,
      );
      return use(Theme);
    }
    await new Promise<void>((resolve, reject) => {
      renderToPipeableStream(
        <Theme value="dom">
          <RenderedByReactDom />
        </Theme>,
        { onAllReady: resolve, onError: reject },
      );
    });
    await expect(converted).resolves.toContain('"default";');
  });
});
