import fc from 'fast-check';
import {
  Digraph,
  type DSL,
  digraph,
  fromDot,
  type GraphBaseModel,
  isAttributeAssignmentModel,
  modelOf,
  Node,
  type RootGraphModel,
  Subgraph,
  type SubgraphModel,
  toDot,
} from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

// A graph's attributes are its graph attribute assignments: the DSL, the
// model and DOT hold them in the same shape, statements in their order.
// A failing run prints its seed; reproduce it with FC_SEED=<seed>.

const key = fc.constantFrom('label', 'bgcolor', 'rankdir', 'fontname');
const value = fc.string({ maxLength: 4 });
const id = fc.constantFrom('a', 'b', 'c', 'd');

type Step =
  | { op: 'assign'; key: string; value: string }
  | { op: 'node'; id: string }
  | { op: 'subgraph'; id: string; steps: Step[] };

const step: fc.Arbitrary<Step> = fc.letrec<{ step: Step }>((tie) => ({
  step: fc.oneof(
    { depthSize: 'small', maxDepth: 2 },
    {
      arbitrary: fc.record({ op: fc.constant('assign' as const), key, value }),
      weight: 3,
    },
    {
      arbitrary: fc.record({ op: fc.constant('node' as const), id }),
      weight: 2,
    },
    {
      arbitrary: fc.record({
        op: fc.constant('subgraph' as const),
        id: fc.constantFrom('cluster_x', 's'),
        steps: fc.array(tie('step'), { maxLength: 3 }),
      }),
      weight: 1,
    },
  ),
})).step;

const steps = fc.array(step, { maxLength: 8 });

/** A body, statement by statement. */
function shapeOf(g: GraphBaseModel): unknown[] {
  return g.statements.map((s) =>
    isAttributeAssignmentModel(s)
      ? ['assign', s.key, s.value]
      : s.$$type === 'Node'
        ? ['node', s.id]
        : s.$$type === 'Subgraph'
          ? ['subgraph', s.id, shapeOf(s)]
          : [s.$$type],
  );
}

function byModel(g: GraphBaseModel, list: Step[]): void {
  for (const s of list) {
    if (s.op === 'assign') g.addAttributeAssignment(s.key as 'label', s.value);
    else if (s.op === 'node') g.addNode(new Node(s.id));
    else {
      const sub = new Subgraph(s.id);
      g.addSubgraph(sub);
      byModel(sub, s.steps);
    }
  }
}

describe('graph attributes as statements', () => {
  it('the DSL builds the same graph as the model does', () => {
    fc.assert(
      fc.property(steps, (list) => {
        const apply = (
          g: DSL<RootGraphModel | SubgraphModel>,
          l: Step[],
        ): void => {
          for (const s of l) {
            if (s.op === 'assign') {
              (g as unknown as Record<string, string>)[s.key] = s.value;
            } else if (s.op === 'node') g.node(s.id);
            else g.subgraph(s.id, (sub) => apply(sub, s.steps));
          }
        };
        const G = digraph('G', (g) => apply(g, list));
        const model = new Digraph('G');
        byModel(model, list);
        expect(shapeOf(modelOf(G))).toStrictEqual(shapeOf(model));
        expect(toDot(G)).toBe(toDot(model));
      }),
    );
  });

  it('model -> DOT -> model keeps the shape and the attributes', () => {
    fc.assert(
      fc.property(steps, (list) => {
        const model = new Digraph('G');
        byModel(model, list);
        const back = fromDot(toDot(model));
        expect(shapeOf(back)).toStrictEqual(shapeOf(model));
        expect(
          back.getAttributeNames().map((k) => [k, back.getAttribute(k)]),
        ).toStrictEqual(
          model.getAttributeNames().map((k) => [k, model.getAttribute(k)]),
        );
      }),
    );
  });

  it('DOT -> model -> DOT prints the same DOT', () => {
    fc.assert(
      fc.property(steps, (list) => {
        const model = new Digraph('G');
        byModel(model, list);
        const dot = toDot(model);
        expect(toDot(fromDot(dot))).toBe(dot);
      }),
    );
  });

  it("getAttribute is the last assignment of the key, as Graphviz reads the graph's", () => {
    fc.assert(
      fc.property(steps, (list) => {
        const model = new Digraph('G');
        byModel(model, list);
        const last = new Map<string, unknown>();
        for (const s of model.statements) {
          if (isAttributeAssignmentModel(s)) last.set(s.key, s.value);
        }
        for (const [k, v] of last) {
          expect(model.getAttribute(k as 'label')).toBe(v);
        }
        expect(model.getAttributeNames()).toStrictEqual([...last.keys()]);
      }),
    );
  });
});
