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

const nodeId = fc.constantFrom('a', 'b', 'c', 'd');
const color = fc.option(fc.constantFrom('red', 'blue'), { nil: undefined });

const statements: fc.Arbitrary<Statement[]> = fc.letrec<{
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
})).list;

// Index keys, as an unkeyed list is matched: an edit changes the element
// at a position, which exercises updates as well as insertions.
function toElement(s: Statement, key: number): ReactNode {
  if (s.kind === 'node') {
    return <Node key={key} id={s.id} color={s.color} />;
  }
  if (s.kind === 'edge') {
    return <Edge key={key} targets={[s.from, s.to]} color={s.color} />;
  }
  return (
    <Subgraph key={key} id={s.id}>
      {toElements(s.body)}
    </Subgraph>
  );
}

function toElements(list: Statement[]): ReactNode {
  return list.map(toElement);
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

describe('host components (property)', () => {
  it('render the same DOT as the model API after every render of a sequence', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(statements, { minLength: 1, maxLength: 4 }),
        fc.boolean(),
        async (sequence, strict) => {
          const Wrapper = strict ? StrictMode : Fragment;
          const root = createRoot();
          try {
            for (const list of sequence) {
              await root.render(
                <Wrapper>
                  <Digraph id="G">{toElements(list)}</Digraph>
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
        },
      ),
      { numRuns: 200 },
    );
  });
});
