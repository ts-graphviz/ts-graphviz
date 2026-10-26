import fc from 'fast-check';
import { Fragment, type ReactNode, StrictMode } from 'react';
import {
  Digraph as DigraphModel,
  type RootGraphModel,
  type SubgraphModel,
  toDot,
} from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Edge } from './components/Edge.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { createRoot } from './createRoot.js';

// A small statement language, rendered both as React elements and with the
// model API; the two must give the same DOT after every render of a
// sequence on one root.
type Statement =
  | { kind: 'node'; id: string; color?: string }
  | { kind: 'edge'; from: string; to: string; color?: string }
  | { kind: 'subgraph'; id?: string; body: Statement[] };

// A statement with the React key it keeps across edits.
type Keyed =
  | (Extract<Statement, { kind: 'node' | 'edge' }> & { key: number })
  | { kind: 'subgraph'; id?: string; body: Keyed[]; key: number };

// One change to the previous render, so that most of the tree stays and
// the reconciler takes its update, move and keyed paths. `path` picks the
// list to change by walking into subgraphs; `at`, `to` and `pick` wrap
// around, and `pick` chooses a value other than the current one.
type Edit =
  | { op: 'insert'; path: number[]; at: number; statement: Statement }
  | {
      op: 'remove' | 'recolor' | 'retarget';
      path: number[];
      at: number;
      pick: number;
    }
  | { op: 'move'; path: number[]; at: number; to: number; pick: number };

const nodeIds = ['a', 'b', 'c', 'd'];
const colors = [undefined, 'red', 'blue'];
const nodeId = fc.constantFrom(...nodeIds);
const color = fc.option(fc.constantFrom('red', 'blue'), { nil: undefined });

const tree = fc.letrec<{
  list: Statement[];
  statement: Statement;
}>((tie) => ({
  statement: fc.oneof(
    { depthSize: 'small', withCrossShrink: true },
    fc.record({ kind: fc.constant('node' as const), id: nodeId, color }),
    fc.record({
      kind: fc.constant('edge' as const),
      from: nodeId,
      to: nodeId,
      color,
    }),
    fc.record({
      kind: fc.constant('subgraph' as const),
      id: fc.option(fc.constantFrom('cluster_x', 'cluster_y'), {
        nil: undefined,
      }),
      body: tie('list'),
    }),
  ),
  list: fc.array(tie('statement'), { maxLength: 5, depthIdentifier: 'list' }),
}));

const path = fc.array(fc.nat(), { maxLength: 3 });
const at = fc.nat();
const pick = fc.nat();

const edit: fc.Arbitrary<Edit> = fc.oneof(
  fc.record({
    op: fc.constant('insert' as const),
    path,
    at,
    statement: tree.statement,
  }),
  ...(['remove', 'recolor', 'retarget'] as const).map((op) =>
    fc.record({ op: fc.constant(op), path, at, pick }),
  ),
  fc.record({ op: fc.constant('move' as const), path, at, to: fc.nat(), pick }),
);

function withKeys(list: Statement[], next: () => number): Keyed[] {
  return list.map((s) =>
    s.kind === 'subgraph'
      ? { ...s, body: withKeys(s.body, next), key: next() }
      : { ...s, key: next() },
  );
}

function listAt(list: Keyed[], path: number[]): Keyed[] {
  let current = list;
  for (const step of path) {
    const subgraphs = current.filter(
      (s): s is Extract<Keyed, { kind: 'subgraph' }> => s.kind === 'subgraph',
    );
    if (subgraphs.length === 0) break;
    current = subgraphs[step % subgraphs.length].body;
  }
  return current;
}

function other<T>(values: T[], current: T, pick: number): T {
  const rest = values.filter((v) => v !== current);
  return rest[pick % rest.length];
}

// Applies an edit in place. An edit that has nothing to act on inserts a
// node instead, so that no render of a sequence is wasted.
function applyEdit(list: Keyed[], e: Edit, next: () => number): void {
  const target = listAt(list, e.path);
  const length = target.length;
  const insert = (statement: Statement) =>
    target.splice(e.at % (length + 1), 0, ...withKeys([statement], next));
  if (e.op === 'insert') return void insert(e.statement);
  const fallback = () =>
    insert({ kind: 'node', id: nodeIds[e.pick % nodeIds.length] });
  const item = length > 0 ? target[e.at % length] : undefined;
  switch (e.op) {
    case 'remove':
      if (!item) return void fallback();
      return void target.splice(e.at % length, 1);
    case 'move': {
      if (length < 2) return void fallback();
      // To any other place, so that a move always changes the order.
      const from = e.at % length;
      const to = e.to % (length - 1);
      const [moved] = target.splice(from, 1);
      return void target.splice(to >= from ? to + 1 : to, 0, moved);
    }
    case 'recolor':
      if (!item || item.kind === 'subgraph') return void fallback();
      item.color = other(colors, item.color, e.pick);
      return;
    case 'retarget':
      if (!item) return void fallback();
      if (item.kind === 'node') item.id = other(nodeIds, item.id, e.pick);
      else if (item.kind === 'edge') item.to = other(nodeIds, item.to, e.pick);
      else item.id = item.id === undefined ? 'cluster_z' : undefined;
      return;
  }
}

function toElement(s: Keyed, key: number, keyed: boolean): ReactNode {
  if (s.kind === 'node') {
    return <Node key={key} id={s.id} color={s.color} />;
  }
  if (s.kind === 'edge') {
    return <Edge key={key} targets={[s.from, s.to]} color={s.color} />;
  }
  return (
    <Subgraph key={key} id={s.id}>
      {toElements(s.body, keyed)}
    </Subgraph>
  );
}

// Stable keys let the reconciler move elements; index keys, as an unkeyed
// list is matched, turn a move into updates of the elements in between.
function toElements(list: Keyed[], keyed: boolean): ReactNode {
  return list.map((s, i) => toElement(s, keyed ? s.key : i, keyed));
}

function build(graph: RootGraphModel | SubgraphModel, list: Statement[]): void {
  for (const s of list) {
    switch (s.kind) {
      case 'node':
        graph.createNode(s.id, s.color ? { color: s.color } : undefined);
        break;
      case 'edge':
        graph.createEdge(
          [s.from, s.to],
          s.color ? { color: s.color } : undefined,
        );
        break;
      case 'subgraph':
        build(graph.createSubgraph(s.id), s.body);
        break;
    }
  }
}

async function assertRenders(
  renders: Iterable<Keyed[]>,
  options: { strict: boolean; keyed: boolean },
): Promise<void> {
  const Wrapper = options.strict ? StrictMode : Fragment;
  const root = createRoot();
  try {
    for (const list of renders) {
      await root.render(
        <Wrapper>
          <Digraph id="G">{toElements(list, options.keyed)}</Digraph>
        </Wrapper>,
      );
      const [rendered] = root.getTopLevelModels() as RootGraphModel[];
      const expected = new DigraphModel('G');
      build(expected, list);
      expect(toDot(rendered)).toBe(toDot(expected));
    }
  } finally {
    root.unmount();
  }
}

describe('host components (property)', () => {
  // Measured over 5 seeds × 200 cases: every render is one edit away from
  // the last (about 4 edits a case) and changes it; the five kinds of edit
  // are about equally common, about 40% of them land inside a subgraph,
  // and a third of the renders repeat a node id in one graph.
  it('render the same DOT as the model API after each edit of a tree', async () => {
    await fc.assert(
      fc.asyncProperty(
        tree.list,
        fc.array(edit, { minLength: 1, maxLength: 8 }),
        fc.boolean(),
        fc.boolean(),
        async (initial, edits, strict, keyed) => {
          let key = 0;
          const next = () => key++;
          const list = withKeys(initial, next);
          function* renders() {
            yield list;
            for (const e of edits) {
              applyEdit(list, e, next);
              yield list;
            }
          }
          await assertRenders(renders(), { strict, keyed });
        },
      ),
      { numRuns: 200 },
    );
  });

  // Unrelated trees one after another: the reconciler replaces most of
  // the elements, which the edits above rarely make it do.
  it('render the same DOT as the model API after each replacement of a tree', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          tree.list.filter((list) => list.length > 0),
          {
            minLength: 2,
            maxLength: 4,
          },
        ),
        fc.boolean(),
        async (sequence, strict) => {
          let key = 0;
          const next = () => key++;
          await assertRenders(
            sequence.map((list) => withKeys(list, next)),
            { strict, keyed: false },
          );
        },
      ),
      { numRuns: 50 },
    );
  });
});
