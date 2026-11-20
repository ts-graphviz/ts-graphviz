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
    // The graph's attribute, as Graphviz reads the body: the last one.
    expect(g.getAttribute('bgcolor')).toBe('blue');
    const [, , assignment] = g.statements;
    expect(isAttributeAssignmentModel(assignment)).toBe(true);
    expect(assignment).toMatchObject({ key: 'bgcolor', value: 'blue' });
    expect(flat(toDot(g))).toBe(
      'digraph { "a"; graph [ bgcolor = "red"; ]; bgcolor = "blue"; "b"; }',
    );
  });

  it('make every one a statement where it is, the first ones included', () => {
    const g = fromDot('digraph { rankdir=LR; bgcolor=red; bgcolor=blue; a }');
    // The graph's attributes are these statements.
    expect(g.getAttribute('rankdir')).toBe('LR');
    expect(g.getAttribute('bgcolor')).toBe('blue');
    expect(
      g.statements
        .filter(isAttributeAssignmentModel)
        .map((s) => [s.key, s.value]),
    ).toEqual([
      ['rankdir', 'LR'],
      ['bgcolor', 'red'],
      ['bgcolor', 'blue'],
    ]);
    expect(flat(toDot(g))).toBe(
      'digraph { rankdir = "LR"; bgcolor = "red"; bgcolor = "blue"; "a"; }',
    );
  });

  it("keep the graph's attributes as they are through DOT", () => {
    const g = new Digraph();
    g.setAttribute('rankdir', 'LR');
    g.addNode(new Node('a'));
    const dot = toDot(g);
    expect(flat(dot)).toBe('digraph { rankdir = "LR"; "a"; }');
    const back = fromDot(dot);
    expect(back.getAttribute('rankdir')).toBe('LR');
    expect(back.statements[0]).toMatchObject({ key: 'rankdir', value: 'LR' });
    expect(toDot(back)).toBe(dot);
  });

  it('keep one after a leading default statement in place, with its comments', () => {
    const dot =
      'digraph {\n  node [shape=box];\n  // why\n  bgcolor=blue; # blue\n  a;\n}';
    const g = fromDot(dot);
    expect(g.getAttribute('bgcolor')).toBe('blue');
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

  it("come from the attribute names of a graph's DSL", () => {
    const G = digraph('G', (g) => {
      g.bgcolor = 'white';
      g.bgcolor = 'red';
      g.node('a');
      g.bgcolor = 'blue';
      g.subgraph('cluster_s', (s) => {
        s.label = 'S';
      });
    });
    expect(flat(toDot(G))).toBe(
      'digraph "G" { bgcolor = "white"; bgcolor = "red"; "a"; bgcolor = "blue"; subgraph "cluster_s" { label = "S"; } }',
    );
    // The last one counts.
    expect(modelOf(G).getAttribute('bgcolor')).toBe('blue');
  });

  it('are own attributes with ts-graphviz/legacy, as in 3.x', () => {
    const G = legacy.digraph((g) => {
      g.node('a');
      g.bgcolor = 'blue';
      expect(g.bgcolor).toBe('blue');
    });
    expect(flat(toDot(G))).toBe('digraph { bgcolor = "blue"; "a"; }');
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
