import {
  Component,
  type ReactNode,
  Suspense,
  startTransition,
  use,
  useDeferredValue,
  useEffect,
  useState,
} from 'react';
import {
  DefaultEventPriority,
  DiscreteEventPriority,
  NoEventPriority,
} from 'react-reconciler/constants.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Node } from './components/Node.js';
import { createRoot } from './createRoot.js';
import { HostConfig, reconciler } from './reconciler.js';
import { renderToDot } from './renderToDot.js';

// #1752: the reconciler wired to its React 19 contract.

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
    await root.render(
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

  it('rejects render with an uncaught error and reports it to onUncaughtError', async () => {
    const onUncaughtError = vi.fn();
    const root = createRoot({ onUncaughtError });
    await expect(
      root.render(
        <Digraph id="G">
          <Thrower />
        </Digraph>,
      ),
    ).rejects.toThrow(RangeError);
    expect(onUncaughtError).toHaveBeenCalledOnce();
  });

  it('passes each callback in its own createContainer position', () => {
    const spy = vi.spyOn(reconciler, 'createContainer');
    const onUncaughtError = vi.fn();
    const onCaughtError = vi.fn();
    const onRecoverableError = vi.fn();
    createRoot({ onUncaughtError, onCaughtError, onRecoverableError });
    const args = spy.mock.calls[0];
    const error = new Error('x');
    (args[6] as (e: unknown, i: object) => void)(error, {});
    (args[7] as (e: unknown, i: object) => void)(error, {});
    (args[8] as (e: unknown, i: object) => void)(error, {});
    expect(onUncaughtError).toHaveBeenCalledWith(error, expect.any(Object));
    expect(onCaughtError).toHaveBeenCalledWith(error, expect.any(Object));
    expect(onRecoverableError).toHaveBeenCalledWith(error, expect.any(Object));
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
    const dot = await renderToDot(
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
    const dot = await renderToDot(<RevealedGraph />);
    expect(dot).toContain('"late";');
  });

  it('settles before render resolves: a node shown by an effect is there', async () => {
    const dot = await renderToDot(
      <Digraph id="G">
        <RevealedNode />
      </Digraph>,
    );
    expect(dot).toContain('"late";');
  });

  it('rejects with an error thrown by a render an effect caused', async () => {
    await expect(
      renderToDot(
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
    const dot = await renderToDot(
      <Digraph id="G">
        <RevealedInTransition />
      </Digraph>,
    );
    expect(dot).toContain('"transition";');
  });

  it('waits for the final value of a deferred value', async () => {
    const dot = await renderToDot(
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
    const dot = await renderToDot(
      <Digraph id="G">
        <Suspense fallback={<Node id="loading" />}>
          <Loaded />
        </Suspense>
      </Digraph>,
    );
    expect(dot).toContain('"loaded";');
    expect(dot).not.toContain('"loading";');
  });

  it('stops waiting when the signal aborts, with its reason', async () => {
    const never = new Promise<string>(() => {});
    function Forever(): ReactNode {
      return <Node id={use(never)} />;
    }
    const element = (
      <Digraph id="G">
        <Suspense fallback={null}>
          <Forever />
        </Suspense>
      </Digraph>
    );
    await expect(
      renderToDot(element, { signal: AbortSignal.timeout(50) }),
    ).rejects.toMatchObject({ name: 'TimeoutError' });

    const controller = new AbortController();
    const root = createRoot();
    const pending = root.render(element, { signal: controller.signal });
    controller.abort(new RangeError('stop'));
    await expect(pending).rejects.toThrow('stop');
  });

  it('rejects a queued render at once when its signal aborts, without running it', async () => {
    const root = createRoot();
    const slow = new Promise<string>((resolve) =>
      setTimeout(() => resolve('slow'), 200),
    );
    function Slow(): ReactNode {
      return <Node id={use(slow)} />;
    }
    const first = root.render(
      <Digraph id="G">
        <Suspense fallback={null}>
          <Slow />
        </Suspense>
      </Digraph>,
    );
    const controller = new AbortController();
    const queued = root.render(
      <Digraph id="queued">
        <Node id="never" />
      </Digraph>,
      { signal: controller.signal },
    );
    controller.abort(new RangeError('queued'));
    const settled = await Promise.race([
      queued.then(
        () => 'resolved',
        (e: unknown) => (e as Error).message,
      ),
      new Promise((resolve) => setTimeout(() => resolve('still pending'), 50)),
    ]);
    expect(settled).toBe('queued');
    await first;
    const [graph] = root.getTopLevelModels();
    expect(graph.$$type === 'Graph' && graph.id).toBe('G');
  });

  it('notices an abort during a render that settles synchronously', async () => {
    const controller = new AbortController();
    function AbortsInEffect(): ReactNode {
      useEffect(() => controller.abort(new RangeError('in effect')), []);
      return <Node id="a" />;
    }
    await expect(
      renderToDot(
        <Digraph id="G">
          <AbortsInEffect />
        </Digraph>,
        { signal: controller.signal },
      ),
    ).rejects.toThrow('in effect');
  });

  it('does not render when the signal has already aborted', async () => {
    const onRenderComplete = vi.fn();
    const root = createRoot({ onRenderComplete });
    await expect(
      root.render(
        <Digraph id="G">
          <Node id="a" />
        </Digraph>,
        { signal: AbortSignal.abort(new RangeError('before')) },
      ),
    ).rejects.toThrow('before');
    expect(onRenderComplete).not.toHaveBeenCalled();
    expect(root.getTopLevelModels()).toEqual([]);
  });
});

describe('renders on one root', () => {
  function Slow({ id }: { id: string }): ReactNode {
    const [shown, setShown] = useState(false);
    useEffect(() => startTransition(() => setShown(true)), []);
    return shown ? <Node id={id} /> : null;
  }

  it('runs one after another, each with its own result', async () => {
    const seen: string[][] = [];
    const root = createRoot({
      onRenderComplete: (models) =>
        seen.push(
          models.flatMap((m) =>
            m.$$type === 'Graph' ? m.nodes.map((n) => n.id) : [],
          ),
        ),
    });
    const first = root.render(
      <Digraph id="G">
        <Slow id="first" />
      </Digraph>,
    );
    const second = root.render(
      <Digraph id="G">
        <Thrower />
      </Digraph>,
    );
    await expect(first).resolves.toBeUndefined();
    await expect(second).rejects.toThrow(RangeError);
    expect(seen).toEqual([['first']]);
  });

  it('rejects a render the root was unmounted during', async () => {
    const root = createRoot();
    const pending = root.render(
      <Digraph id="G">
        <Slow id="late" />
      </Digraph>,
    );
    root.unmount();
    await expect(pending).rejects.toThrow(/unmounted/);
  });
});
