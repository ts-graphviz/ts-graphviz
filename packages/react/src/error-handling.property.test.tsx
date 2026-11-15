import fc from 'fast-check';
import { Component, lazy, type ReactNode, Suspense } from 'react';
import { Digraph as DigraphModel, type NodeModel } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { Node } from './components/Node.js';
import { type CreateRootOptions, createRoot } from './createRoot.js';
import { fromElement } from './fromElement.js';
import { uncaughtDuring } from './test-utils/render.js';

// Random trees of error boundaries, components that throw (once or on
// every render), suspended components and nesting, rendered with error
// callbacks that do nothing, record or throw. A conversion settles and
// reports nothing outside its promise; a root reports outside it only what
// its callbacks threw, and renders again.
type Tree =
  | { kind: 'node'; id: string }
  | { kind: 'boundary'; body: Tree[] }
  | { kind: 'throws'; once: boolean }
  | { kind: 'suspends'; fallback: boolean }
  | { kind: 'nest'; depth: number; body: Tree[] };

type Callback = 'none' | 'record' | 'throw';

const arbitraries = fc.letrec<{ list: Tree[]; tree: Tree }>((tie) => ({
  list: fc.array(tie('tree'), { maxLength: 3 }),
  tree: fc.oneof(
    { depthSize: 'small', withCrossShrink: true },
    fc.record({
      kind: fc.constant('node' as const),
      id: fc.constantFrom('a', 'b', 'c'),
    }),
    fc.record({ kind: fc.constant('boundary' as const), body: tie('list') }),
    fc.record({ kind: fc.constant('throws' as const), once: fc.boolean() }),
    fc.record({
      kind: fc.constant('suspends' as const),
      fallback: fc.boolean(),
    }),
    fc.record({
      kind: fc.constant('nest' as const),
      depth: fc.integer({ min: 1, max: 50 }),
      body: tie('list'),
    }),
  ),
}));

const callback = fc.constantFrom<Callback>('none', 'record', 'throw');

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <Node id="fallback" /> : this.props.children;
  }
}

const Pending = lazy(
  () => new Promise<{ default: () => ReactNode }>(() => undefined),
);

function Nest({ depth, children }: { depth: number; children: ReactNode }) {
  return depth > 0 ? <Nest depth={depth - 1}>{children}</Nest> : children;
}

function toElements(trees: Tree[]): ReactNode {
  return trees.map((t, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: generated, static lists
    <Element key={i} tree={t} />
  ));
}

function Element({ tree }: { tree: Tree }): ReactNode {
  switch (tree.kind) {
    case 'node':
      return <Node id={tree.id} />;
    case 'boundary':
      return <Boundary>{toElements(tree.body)}</Boundary>;
    case 'throws':
      return <Throws tree={tree} />;
    case 'suspends':
      return tree.fallback ? (
        <Suspense fallback={<Node id="loading" />}>
          <Pending />
        </Suspense>
      ) : (
        <Pending />
      );
    case 'nest':
      return <Nest depth={tree.depth}>{toElements(tree.body)}</Nest>;
  }
}

// Throws on its first render, or on every render.
const thrown = new WeakSet<Tree>();
function Throws({
  tree,
}: {
  tree: Extract<Tree, { kind: 'throws' }>;
}): ReactNode {
  if (!tree.once || !thrown.has(tree)) {
    thrown.add(tree);
    throw new Error('thrown by the tree');
  }
  return <Node id="recovered" />;
}

function options(
  kinds: [Callback, Callback, Callback],
): Pick<
  CreateRootOptions,
  'onUncaughtError' | 'onCaughtError' | 'onRecoverableError'
> {
  const make = (kind: Callback) =>
    kind === 'none'
      ? undefined
      : kind === 'record'
        ? () => undefined
        : () => {
            throw new Error('thrown by a callback');
          };
  return {
    onUncaughtError: make(kinds[0]),
    onCaughtError: make(kinds[1]),
    onRecoverableError: make(kinds[2]),
  };
}

// Whether the conversion must resolve: nothing suspends (a pending
// component waits until the signal aborts), nothing outside a boundary
// throws (React renders again only once, so two components that throw once
// can still reject), and no callback that throws could be called.
function mustResolve(trees: Tree[], kinds: [Callback, Callback, Callback]) {
  let throws = false;
  let uncaught = false;
  let suspends = false;
  const walk = (list: Tree[], inBoundary: boolean) => {
    for (const t of list) {
      if (t.kind === 'throws') {
        throws = true;
        if (!inBoundary) uncaught = true;
      } else if (t.kind === 'suspends') {
        suspends = true;
      } else if (t.kind === 'boundary') {
        walk(t.body, true);
      } else if (t.kind === 'nest') {
        walk(t.body, inBoundary);
      }
    }
  };
  walk(trees, false);
  return !suspends && !uncaught && !(throws && kinds.includes('throw'));
}

const inputs = [
  fc.array(arbitraries.tree, { maxLength: 4 }),
  fc.tuple(callback, callback, callback),
] as const;

describe('error handling', () => {
  it('settles every conversion, inside its promise, and leaves nothing behind when it rejects', async () => {
    const uncaught = await uncaughtDuring(async () => {
      await fc.assert(
        fc.asyncProperty(...inputs, async (generated, kinds) => {
          // Fresh objects: a component that throws once is keyed by its
          // tree, and a replay while shrinking must throw again.
          const trees = structuredClone(generated);
          const container = new DigraphModel('G');
          const { onCaughtError, onRecoverableError } = options(kinds);
          const resolved = await fromElement(<>{toElements(trees)}</>, {
            container,
            onCaughtError,
            onRecoverableError,
            // A suspended tree waits for its data: stop waiting, as a
            // caller would.
            signal: AbortSignal.timeout(20),
          }).then(
            () => true,
            () => false,
          );
          if (mustResolve(trees, kinds)) expect(resolved).toBe(true);
          if (!resolved) expect(container.nodes).toHaveLength(0);
        }),
      );
    });
    expect(uncaught).toEqual([]);
  });

  it('reports outside a root only what its callbacks threw, and the root renders again', async () => {
    await fc.assert(
      fc.asyncProperty(...inputs, async (generated, kinds) => {
        const trees = structuredClone(generated);
        const container = new DigraphModel('G');
        const completed: string[][] = [];
        const root = createRoot({
          container,
          ...options(kinds),
          onRenderComplete: (models) =>
            completed.push(models.map((m) => (m as NodeModel).id)),
        });
        try {
          // The same root renders again. (A tree that suspended as a
          // whole is rendered to its end only now, so its errors can still
          // be reported.)
          const uncaught = await uncaughtDuring(async () => {
            root.render(<>{toElements(trees)}</>);
            await new Promise((resolve) => setTimeout(resolve, 0));
            root.render(<Node id="after" />);
            await new Promise((resolve) => setTimeout(resolve, 0));
          });
          expect(uncaught.map(String)).toEqual(
            uncaught.map(() => 'Error: thrown by a callback'),
          );
          if (!kinds.includes('throw')) expect(uncaught).toEqual([]);
          expect(container.nodes.map((n) => n.id)).toEqual(['after']);
          expect(completed.at(-1)).toEqual(['after']);
        } finally {
          root.unmount();
        }
        expect(container.nodes).toHaveLength(0);
      }),
    );
  });
});
