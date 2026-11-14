import { spawnSync } from 'node:child_process';
import {
  createModelKit,
  Digraph,
  defaultModelKit,
  digraph,
  fromDot,
  LegacyDigraph,
  LegacySubgraph,
  legacyModels,
  modelOf,
  Node,
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

// Default attribute statements apply, in DOT, only to what follows them.
// The default model classes keep the statements in place; the deprecated
// classes of `legacyModels` keep one set of defaults per graph, as 3.x did
// (#1732, #1922).
const sources = [
  'digraph { node [color=red]; a; node [color=blue]; b }',
  'digraph { a -> b; edge [color=red]; c -> d }',
  'digraph { a; node [shape=box] }',
  'digraph { node [color=red]; subgraph s { a; node [color=blue]; b } c }',
  'graph { a -- b; edge [style=dashed]; b -- c; node [shape=box]; d }',
];

describe('the default classes', () => {
  describe('with dot', { tags: ['process'] }, () => {
    beforeEach(({ skip }) => skip(!hasDot(), 'dot is not installed'));
    it.each(sources)('render %s as the source does', (dot) => {
      expect(canon(toDot(fromDot(dot)))).toBe(canon(dot));
    });
  });

  it('keep a default statement after other statements in its place', () => {
    const g = fromDot('digraph { node [color=red]; a; node [color=blue]; b }');
    expect(g).toBeInstanceOf(Digraph);
    expect(g.attributes.node.values).toEqual([['color', 'red']]);
    expect(g.statements.map((s) => s.$$type)).toEqual([
      'Node',
      'AttributeList',
      'Node',
    ]);
    expect(toDot(g).replace(/\s+/g, ' ')).toBe(
      'digraph { node [ color = "red"; ]; "a"; node [ color = "blue"; ]; "b"; }',
    );
  });

  it('keep it in place when built by hand too, subgraphs included', () => {
    const g = new Digraph();
    g.addNode(defaultModelKit.createNode('a'));
    g.addAttributeList('Node', { color: 'blue' });
    g.addNode(defaultModelKit.createNode('b'));
    const s = defaultModelKit.createSubgraph('s');
    g.addSubgraph(s);
    s.addNode(defaultModelKit.createNode('c'));
    s.addAttributeList('Edge', { style: 'dashed' });
    expect(s.statements.map((x) => x.$$type)).toEqual([
      'Node',
      'AttributeList',
    ]);
  });

  it('return the list addAttributeList adds, to change it later', () => {
    const g = new Digraph();
    // Before any statement: the leading defaults.
    const first = g.addAttributeList('Node', { shape: 'box' });
    expect(first).toBe(g.attributes.node);
    g.addNode(defaultModelKit.createNode('a'));
    // After one: a statement of its own.
    const later = g.addAttributeList('Node', { color: 'blue' });
    expect(later.$$kind).toBe('Node');
    expect(g.statements.at(-1)).toBe(later);
    later.set('color', 'green');
    expect(toDot(g)).toContain('color = "green"');
  });

  it("give the DSL of that list from the DSL's default statements", () => {
    const G = digraph((g) => {
      g.node('a');
      const defaults = g.node({ color: 'blue' });
      expect(defaults.$$kind).toBe('Node');
      defaults.color = 'green';
      expect(modelOf(g).statements.at(-1)).toBe(modelOf(defaults));
      expect(g.edge({ style: 'dashed' }).$$kind).toBe('Edge');
      expect(g.graph({ label: 'G' }).$$kind).toBe('Graph');
    });
    expect(toDot(G)).toContain('color = "green"');
  });
});

describe('the deprecated legacyModels', () => {
  it('keep one set of defaults per graph, as 3.x did', () => {
    const g = fromDot('digraph { node [color=red]; a; node [color=blue]; b }', {
      convert: { models: legacyModels },
    });
    expect(g).toBeInstanceOf(LegacyDigraph);
    expect(g.attributes.node.values).toEqual([['color', 'blue']]);
    expect(g.statements.every((s) => s.$$type === 'Node')).toBe(true);
  });

  it('merge by hand and through ts-graphviz/legacy, subgraphs included', () => {
    const g = new LegacyDigraph();
    g.addNode(new Node('a'));
    const list = g.addAttributeList('Node', { color: 'blue' });
    expect(list).toBe(g.attributes.node);
    const s = new LegacySubgraph('s');
    g.addSubgraph(s);
    s.addNode(new Node('c'));
    s.addAttributeList('Edge', { style: 'dashed' });
    expect(s.statements.map((x) => x.$$type)).toEqual(['Node']);
    // A kit of the legacy classes creates legacy graphs and subgraphs.
    const kit = createModelKit(legacyModels);
    expect(kit.createDigraph()).toBeInstanceOf(LegacyDigraph);
    expect(kit.createSubgraph('u')).toBeInstanceOf(LegacySubgraph);
    const built = legacy.digraph((g) => {
      g.node('a');
      g.node({ color: 'blue' });
    });
    expect(modelOf(built).attributes.node.getAttribute('color')).toBe('blue');
    expect(modelOf(built).statements.map((x) => x.$$type)).toEqual(['Node']);
  });
});
