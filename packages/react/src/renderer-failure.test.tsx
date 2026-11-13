import {
  type ReactElement,
  type ReactNode,
  Suspense,
  startTransition,
  use,
  useEffect,
  useState,
} from 'react';
import { Digraph as DigraphModel, type RootGraphModel } from 'ts-graphviz';
import { describe, expect, it, vi } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Node } from './components/Node.js';
import { createRoot, type GraphvizRoot } from './createRoot.js';
import { fromElement } from './fromElement.js';
import { currentGeneration } from './reconciler.js';
import { render, uncaughtDuring } from './test-utils/render.js';

// React handles what components throw. What is thrown out of its own work
// stops the renderer for every tree: the trees are told, and the next
// render starts on a new renderer. The failure is brought about here the
// way the renderer reports it to itself.

const tick = (ms = 0): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const failure = new RangeError('thrown out of the work of React');

function failRenderer(): void {
  currentGeneration().fail(failure);
}

// The same while React renders a tree of `root`: the failure is that tree's.
async function failWhileRendering(root: GraphvizRoot): Promise<void> {
  function Fails(): ReactNode {
    failRenderer();
    return null;
  }
  root.render(<Fails />);
  await tick();
}

function nodeIds(root: GraphvizRoot): string[] {
  return (root.getTopLevelModels() as RootGraphModel[]).flatMap((graph) =>
    graph.nodes.map((n) => n.id),
  );
}

function graphOf(id: string): ReactElement {
  return (
    <Digraph id="G">
      <Node id={id} />
    </Digraph>
  );
}

// Shows "first", then waits for its data in a transition: React has work
// left for the tree until the data is there.
function Waits({ data }: { data: Promise<string> }): ReactNode {
  const [waiting, setWaiting] = useState(false);
  useEffect(() => startTransition(() => setWaiting(true)), []);
  return <Node id={waiting ? use(data) : 'first'} />;
}

describe('a failure of the renderer', () => {
  it('gives the tree React worked on last the error and takes its models out', async () => {
    const container = new DigraphModel('C');
    const onUncaughtError = vi.fn();
    const root = createRoot({ container, onUncaughtError });
    await render(root, <Node id="a" />);
    expect(container.nodes).toHaveLength(1);

    failRenderer();

    expect(onUncaughtError).toHaveBeenCalledExactlyOnceWith(failure, {});
    expect(container.nodes).toHaveLength(0);
    expect(root.getTopLevelModels()).toEqual([]);
    root.unmount();
  });

  it('tells the other roots, which keep their models until they render again', async () => {
    const onUncaughtError = vi.fn();
    const onRenderComplete = vi.fn();
    const other = createRoot({ onUncaughtError, onRenderComplete });
    await render(other, graphOf('kept'));
    const last = createRoot();
    await render(last, graphOf('last'));
    onRenderComplete.mockClear();

    await failWhileRendering(last);

    expect(onUncaughtError).toHaveBeenCalledOnce();
    const [error] = onUncaughtError.mock.calls[0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toMatch(
      /^The renderer failed while it rendered another tree/,
    );
    expect(error.cause).toBe(failure);
    expect(nodeIds(other)).toEqual(['kept']);

    // A new tree: the state of the old one is gone with it.
    await render(other, graphOf('again'));
    expect(nodeIds(other)).toEqual(['again']);
    expect(onRenderComplete).toHaveBeenCalledOnce();
    await render(last, graphOf('last again'));
    expect(nodeIds(last)).toEqual(['last again']);
    other.unmount();
    last.unmount();
  });

  it('does not put the models of a tree that was lost in twice', async () => {
    const container = new DigraphModel('C');
    const root = createRoot({ container, onUncaughtError: () => undefined });
    await render(root, <Node id="a" />);
    const last = createRoot();
    await render(last, graphOf('last'));

    await failWhileRendering(last);
    expect(container.nodes.map((n) => n.id)).toEqual(['a']);

    await render(
      root,
      <>
        <Node id="a" />
        <Node id="b" />
      </>,
    );
    expect(container.nodes.map((n) => n.id)).toEqual(['a', 'b']);
    root.unmount();
    expect(container.nodes).toHaveLength(0);
    last.unmount();
  });

  it('replaces the models of a tree that was lost by those of the next render', async () => {
    const container = new DigraphModel('C');
    const root = createRoot({ container, onUncaughtError: () => undefined });
    await render(root, <Node id="a" />);
    const last = createRoot();
    await render(last, graphOf('last'));

    await failWhileRendering(last);
    await render(root, <Node id="b" />);

    expect(container.nodes.map((n) => n.id)).toEqual(['b']);
    root.unmount();
    expect(container.nodes).toHaveLength(0);
    last.unmount();
  });

  it('takes the models of a tree that was lost out when its root is unmounted', async () => {
    const container = new DigraphModel('C');
    const root = createRoot({ container, onUncaughtError: () => undefined });
    await render(root, <Node id="a" />);
    const last = createRoot();
    await render(last, graphOf('last'));

    await failWhileRendering(last);
    expect(container.nodes.map((n) => n.id)).toEqual(['a']);

    root.unmount();
    expect(container.nodes).toHaveLength(0);
    last.unmount();
  });

  it('starts a conversion that was waiting again, on the new renderer', async () => {
    let resolve!: (id: string) => void;
    const data = new Promise<string>((r) => {
      resolve = r;
    });
    const container = new DigraphModel('C');
    const pending = fromElement(
      <>
        <Node id="shown" />
        <Waits data={data} />
      </>,
      { container },
    );
    await tick();
    expect(container.nodes.map((n) => n.id)).toEqual(['shown', 'first']);
    const last = createRoot();
    await render(last, graphOf('last'));

    await failWhileRendering(last);
    await tick();
    // Rendered from the start, with nothing of the first try left over.
    expect(container.nodes.map((n) => n.id)).toEqual(['shown', 'first']);

    resolve('loaded');
    await expect(pending).resolves.toBe(container);
    expect(container.nodes.map((n) => n.id)).toEqual(['shown', 'loaded']);
    last.unmount();
  });

  it('rejects a conversion the renderer keeps failing under, with the last failure as the cause', async () => {
    const container = new DigraphModel('C');
    const pending = fromElement(<Waits data={new Promise(() => undefined)} />, {
      container,
    });
    pending.catch(() => undefined);
    for (let i = 0; i < 3; i++) {
      await tick();
      expect(container.nodes.map((n) => n.id)).toEqual(['first']);
      const last = createRoot();
      await render(last, graphOf('last'));
      await failWhileRendering(last);
    }
    await expect(pending).rejects.toMatchObject({
      message: 'The renderer failed 3 times while it rendered other trees',
      cause: failure,
    });
    expect(container.nodes).toHaveLength(0);
  });

  it('rejects the conversion React worked on last with the error', async () => {
    const container = new DigraphModel('C');
    const pending = fromElement(<Waits data={new Promise(() => undefined)} />, {
      container,
    });
    pending.catch(() => undefined);
    await tick();
    failRenderer();
    await expect(pending).rejects.toBe(failure);
    expect(container.nodes).toHaveLength(0);
  });
});

describe('what a lost tree still does', () => {
  it('ignores a timer of the old tree that sets state', async () => {
    const container = new DigraphModel('C');
    const ticks = vi.fn();
    function Counting(): ReactNode {
      const [count, setCount] = useState(0);
      useEffect(() => {
        const timer = setInterval(() => {
          ticks();
          setCount((n) => n + 1);
        }, 1);
        return () => clearInterval(timer);
      }, []);
      return <Node id={`count-${Math.min(count, 1)}`} />;
    }
    const onUncaughtError = vi.fn();
    const root = createRoot({ container, onUncaughtError });
    const last = createRoot();
    const uncaught = await uncaughtDuring(async () => {
      await render(root, <Counting />);
      await render(last, graphOf('last'));
      await failWhileRendering(last);
      expect(onUncaughtError).toHaveBeenCalledOnce();

      await render(root, <Node id="new" />);
      ticks.mockClear();
      await vi.waitFor(() =>
        expect(ticks.mock.calls.length).toBeGreaterThan(2),
      );
      // The old tree's timer goes on (its effects could not be cleaned up),
      // and its updates reach nothing.
      expect(container.nodes.map((n) => n.id)).toEqual(['new']);
    });
    expect(uncaught).toEqual([]);
    expect(onUncaughtError).toHaveBeenCalledOnce();
    root.unmount();
    last.unmount();
    expect(container.nodes).toHaveLength(0);
  });

  it('ignores data of the old tree that arrives after the root rendered again', async () => {
    let resolve!: (id: string) => void;
    const data = new Promise<string>((r) => {
      resolve = r;
    });
    function Loaded(): ReactNode {
      return <Node id={use(data)} />;
    }
    const element = (
      <Suspense fallback={<Node id="loading" />}>
        <Loaded />
      </Suspense>
    );
    const container = new DigraphModel('C');
    const onUncaughtError = vi.fn();
    const root = createRoot({ container, onUncaughtError });
    const last = createRoot();
    const uncaught = await uncaughtDuring(async () => {
      await render(root, element);
      expect(container.nodes.map((n) => n.id)).toEqual(['loading']);
      await render(last, graphOf('last'));
      await failWhileRendering(last);

      await render(root, element);
      resolve('loaded');
      await vi.waitFor(() =>
        expect(container.nodes.map((n) => n.id)).toEqual(['loaded']),
      );
      await tick(10);
      expect(container.nodes.map((n) => n.id)).toEqual(['loaded']);
    });
    expect(uncaught).toEqual([]);
    expect(onUncaughtError).toHaveBeenCalledOnce();
    root.unmount();
    last.unmount();
  });
});
