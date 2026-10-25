import { spawnSync } from 'node:child_process';
import { fromDot, toDot } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

// A node statement for a node that already exists adds to its attributes,
// as Graphviz does; the model used to keep only the last statement.
describe('a node mentioned twice', () => {
  it('keeps the attributes of every mention', () => {
    const g = fromDot('digraph { a [color=red]; b; a [shape=box] }');
    expect(g.nodes.map((n) => n.id)).toEqual(['a', 'b']);
    expect(g.getNode('a')?.attributes.values).toEqual([
      ['color', 'red'],
      ['shape', 'box'],
    ]);
  });

  it('lets a later mention override a value, as Graphviz does', () => {
    const g = fromDot('digraph { a [color=red]; a [color=blue] }');
    expect(g.getNode('a')?.attributes.get('color')).toBe('blue');
  });

  it.skipIf(spawnSync('dot', ['-V']).status !== 0)(
    'renders as the source does',
    () => {
      const dot = 'digraph { a [color=red, label=x]; a [shape=box] }';
      const canon = (s: string) =>
        spawnSync('dot', ['-Tcanon'], { input: s, encoding: 'utf8' }).stdout;
      expect(canon(toDot(fromDot(dot)))).toBe(canon(dot));
    },
  );
});
