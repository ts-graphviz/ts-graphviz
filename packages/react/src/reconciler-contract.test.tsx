import { Component, type ReactNode, useEffect, useState } from 'react';
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

  it('keeps the string type of a host element', () => {
    const host = new HostConfig();
    const instance = host.createInstance(
      'dot:td' as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    expect(instance.type).toBe('dot:td');
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
