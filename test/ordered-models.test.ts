import { spawnSync } from 'node:child_process';
import {
  digraph,
  fromDot,
  OrderedDigraph,
  orderedModels,
  toDot,
} from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

const hasDot = spawnSync('dot', ['-V']).status === 0;
const canon = (dot: string) =>
  spawnSync('dot', ['-Tcanon'], { input: dot, encoding: 'utf8' }).stdout;

// Default attribute statements apply, in DOT, only to what follows them.
// The default model classes keep one set of defaults per graph; the
// classes of `orderedModels` keep the statements in place (#1732).
const sources = [
  'digraph { node [color=red]; a; node [color=blue]; b }',
  'digraph { a -> b; edge [color=red]; c -> d }',
  'digraph { a; node [shape=box] }',
  'digraph { node [color=red]; subgraph s { a; node [color=blue]; b } c }',
  'graph { a -- b; edge [style=dashed]; b -- c; node [shape=box]; d }',
];

describe('orderedModels', () => {
  it.skipIf(!hasDot).each(sources)('renders %s as the source does', (dot) => {
    const model = fromDot(dot, { convert: { models: orderedModels } });
    expect(canon(toDot(model))).toBe(canon(dot));
  });

  it('keeps a default statement after other statements in its place', () => {
    const g = fromDot('digraph { node [color=red]; a; node [color=blue]; b }', {
      convert: { models: orderedModels },
    });
    expect(g).toBeInstanceOf(OrderedDigraph);
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

  it('builds ordered graphs by hand too, subgraphs included', () => {
    const g = new OrderedDigraph();
    g.node('a');
    g.addAttributeList('Node', { color: 'blue' });
    g.node('b');
    const s = g.subgraph('s');
    s.node('c');
    s.addAttributeList('Edge', { style: 'dashed' });
    expect(s.statements.map((x) => x.$$type)).toEqual([
      'Node',
      'AttributeList',
    ]);
  });

  it('leaves the default classes as they were: one set of defaults per graph', () => {
    const g = fromDot('digraph { node [color=red]; a; node [color=blue]; b }');
    expect(g.attributes.node.values).toEqual([['color', 'blue']]);
    expect(g.statements.every((s) => s.$$type === 'Node')).toBe(true);
    const built = digraph((g) => {
      g.node('a');
      g.addAttributeList('Node', { color: 'blue' });
    });
    expect(built.attributes.node.get('color')).toBe('blue');
  });
});
