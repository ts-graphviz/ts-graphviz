import { spawnSync } from 'node:child_process';
import {
  AttributeAssignment,
  Digraph,
  digraph,
  fromDot,
  isAttributeAssignmentModel,
  LegacyDigraph,
  legacyModels,
  modelOf,
  Node,
  Subgraph,
  toDot,
} from 'ts-graphviz';
import * as legacy from 'ts-graphviz/legacy';
import { beforeEach, describe, expect, it } from 'vitest';

let dotInstalled: boolean | undefined;
/** Whether `dot` runs, asked by the first test that needs it. */
const hasDot = () =>
  (dotInstalled ??= spawnSync('dot', ['-V'], { timeout: 10_000 }).status === 0);
const canon = (dot: string) => {
  const r = spawnSync('dot', ['-Tcanon'], {
    input: dot,
    encoding: 'utf8',
    timeout: 30_000,
  });
  expect(r.status, `${dot}\n${r.stderr}`).toBe(0);
  return r.stdout;
};

// In a graph's body, `color=blue` is read by Graphviz as `graph
// [color=blue]` where it is written: a later one overrides it, and it is
// the default of the subgraphs that follow it only.
const sources = [
  'digraph { a; graph [color=red]; color=blue; b }',
  'digraph { a; color=blue; graph [color=red]; b }',
  'digraph { graph [color=red]; color=blue; a }',
  'digraph { color=blue; graph [color=red]; a }',
  'digraph { subgraph cluster_x { a } color=blue; subgraph cluster_y { b } }',
  'digraph { a; label=x; subgraph cluster_s { b; color=red; subgraph cluster_t { c } } label=y }',
];

const flat = (dot: string) => dot.replace(/\s+/g, ' ');

describe('graph attribute assignments', () => {
  describe('with dot', { tags: ['process'] }, () => {
    beforeEach(({ skip }) => skip(!hasDot(), 'dot is not installed'));
    it.each(sources)('render %s as the source does', (dot) => {
      expect(canon(toDot(fromDot(dot)))).toBe(canon(dot));
    });
  });

  it.each(sources)('print %s the same again once read back', (dot) => {
    const once = toDot(fromDot(dot));
    expect(toDot(fromDot(once))).toBe(once);
  });

  it('keep an assignment after another statement where it is written', () => {
    const g = fromDot('digraph { a; graph [bgcolor=red]; bgcolor=blue; b }');
    expect(g.getAttribute('bgcolor')).toBeUndefined();
    const [, , assignment] = g.statements;
    expect(isAttributeAssignmentModel(assignment)).toBe(true);
    expect(assignment).toMatchObject({ key: 'bgcolor', value: 'blue' });
    expect(flat(toDot(g))).toBe(
      'digraph { "a"; graph [ bgcolor = "red"; ]; bgcolor = "blue"; "b"; }',
    );
  });

  it("make one before every other statement the graph's own attribute", () => {
    const g = fromDot('digraph { bgcolor=blue; node [shape=box]; a }');
    expect(g.getAttribute('bgcolor')).toBe('blue');
    expect(g.statements.map((s) => s.$$type)).toEqual(['Node']);
    // After a `graph [...]` list, it stays after it.
    const h = fromDot('digraph { graph [bgcolor=red]; bgcolor=blue; a }');
    expect(h.getAttribute('bgcolor')).toBeUndefined();
    expect(h.statements.map((s) => s.$$type)).toEqual([
      'AttributeAssignment',
      'Node',
    ]);
  });

  it('keep one after a leading default statement in place, with its comments', () => {
    const dot =
      'digraph {\n  node [shape=box];\n  // why\n  bgcolor=blue; # blue\n  a;\n}';
    const g = fromDot(dot);
    expect(g.getAttribute('bgcolor')).toBeUndefined();
    const [assignment] = g.statements;
    expect(isAttributeAssignmentModel(assignment)).toBe(true);
    expect(
      assignment.comments.map((c) => [c.text, c.kind, c.position]),
    ).toEqual([
      ['why', 'Slash', 'leading'],
      ['blue', 'Macro', 'trailing'],
    ]);
    const once = toDot(g);
    expect(flat(once)).toBe(
      'digraph { node [ shape = "box"; ]; // why bgcolor = "blue"; # blue "a"; }',
    );
    expect(toDot(fromDot(once))).toBe(once);
  });

  it('make consecutive leading ones own attributes, the last of a key winning', () => {
    const g = fromDot('digraph { bgcolor=red; label=L; bgcolor=blue; a }');
    expect(g.getAttribute('bgcolor')).toBe('blue');
    expect(g.getAttribute('label')).toBe('L');
    expect(g.statements.map((s) => s.$$type)).toEqual(['Node']);
  });

  it('give an assignment its comments', () => {
    const dot =
      'digraph {\n  a;\n  // why\n  bgcolor=blue; /* blue */\n  b;\n}';
    const g = fromDot(dot);
    const assignment = g.statements[1];
    expect(
      assignment.comments.map((c) => [c.text, c.kind, c.position]),
    ).toEqual([
      ['why', 'Slash', 'leading'],
      ['blue', 'Block', 'trailing'],
    ]);
    expect(toDot(g)).toBe(
      'digraph {\n  "a";\n  // why\n  bgcolor = "blue"; /* blue */\n  "b";\n}',
    );
  });

  it('are added, changed and removed by hand', () => {
    const g = new Digraph();
    g.addNode(new Node('a'));
    const assignment = g.addAttributeAssignment('bgcolor', 'blue');
    expect(assignment).toBeInstanceOf(AttributeAssignment);
    const s = new Subgraph('cluster_s');
    g.addSubgraph(s);
    s.addAttributeAssignment('label', 'S');
    expect(flat(toDot(g))).toBe(
      'digraph { "a"; bgcolor = "blue"; subgraph "cluster_s" { label = "S"; } }',
    );
    assignment.value = 'red';
    expect(flat(toDot(g))).toContain('bgcolor = "red";');
    g.removeAttributeAssignment(assignment);
    expect(flat(toDot(g))).toBe(
      'digraph { "a"; subgraph "cluster_s" { label = "S"; } }',
    );
  });

  it("come from the DSL's assign", () => {
    const G = digraph((g) => {
      g.bgcolor = 'red';
      g.node('a');
      const assignment = g.assign('bgcolor', 'blue');
      expect(assignment.$$type).toBe('AttributeAssignment');
      expect([assignment.key, assignment.value]).toEqual(['bgcolor', 'blue']);
      assignment.addComment('later');
    });
    expect(flat(toDot(G))).toBe(
      'digraph { bgcolor = "red"; "a"; // later bgcolor = "blue"; }',
    );
    expect(modelOf(G).getAttribute('bgcolor')).toBe('red');
  });

  it('are own attributes with ts-graphviz/legacy, as in 3.x', () => {
    const g = legacy.fromDot(
      'digraph { a; graph [bgcolor=red]; bgcolor=blue; b }',
    );
    expect(g).toBeInstanceOf(LegacyDigraph);
    expect(g.getAttribute('bgcolor')).toBe('blue');
    expect(g.statements.map((s) => s.$$type)).toEqual(['Node', 'Node']);
    // With the legacy classes given to ts-graphviz itself, the conversion is
    // v4's: the assignment keeps its place.
    const h = fromDot('digraph { a; bgcolor=blue }', {
      convert: { models: legacyModels },
    });
    expect(h.statements.map((s) => s.$$type)).toEqual([
      'Node',
      'AttributeAssignment',
    ]);
  });
});
