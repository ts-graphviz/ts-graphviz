import { spawnSync } from 'node:child_process';
import { Digraph, fromDot, legacyModels, toDot } from 'ts-graphviz';
import * as legacy from 'ts-graphviz/legacy';
import { describe, expect, it } from 'vitest';

// Each node statement is a declaration of its own, where it is written, as
// in DOT: Graphviz applies the attributes of each in turn.
describe('a node mentioned twice', () => {
  it('keeps each mention where it is written, with its attributes', () => {
    const g = fromDot('digraph { a [color=red]; b; a [shape=box] }');
    expect(g.getNodes().map((n) => n.id)).toEqual(['a', 'b', 'a']);
    expect(g.getNodes('a').map((n) => n.attributes.values)).toEqual([
      [['color', 'red']],
      [['shape', 'box']],
    ]);
    expect(toDot(g).replace(/\s+/g, ' ')).toBe(
      'digraph { "a" [ color = "red"; ]; "b"; "a" [ shape = "box"; ]; }',
    );
  });

  it('is merged into one node by ts-graphviz/legacy, as in 3.x', () => {
    const g = legacy.fromDot(
      'digraph { a [color=red]; b; a [color=blue, shape=box] }',
    );
    expect(g.getNodes().map((n) => n.id)).toEqual(['a', 'b']);
    expect(g.getNodes()[0]?.attributes.values).toEqual([
      ['color', 'blue'],
      ['shape', 'box'],
    ]);
    const kept = legacy.fromDot('digraph { a [color=red]; a [shape=box] }');
    expect(kept.getNodes()[0]?.attributes.values).toEqual([
      ['color', 'red'],
      ['shape', 'box'],
    ]);
  });

  it('is merged by ts-graphviz/legacy with classes of v4 too', () => {
    const g = legacy.fromDot(
      'digraph { a [color=red]; a [shape=box]; subgraph s { b } subgraph s { c } }',
      { convert: { models: { Digraph } } },
    );
    expect(g).toBeInstanceOf(Digraph);
    expect(g.getNodes()).toHaveLength(1);
    expect(g.getNodes()[0]?.attributes.values).toEqual([
      ['color', 'red'],
      ['shape', 'box'],
    ]);
    expect(g.getSubgraphs()).toHaveLength(1);
    expect(
      g
        .getSubgraphs()[0]
        ?.getNodes()
        .map((n) => n.id),
    ).toEqual(['b', 'c']);
  });

  it('replaces the node of a legacy class read by fromDot of ts-graphviz', () => {
    // The legacy class holds one node per id; the conversion of ts-graphviz
    // declares each mention, so the last one takes the place of the first.
    const g = fromDot('digraph { a [color=red]; b; a [shape=box] }', {
      convert: { models: legacyModels },
    });
    expect(g.getNodes().map((n) => n.id)).toEqual(['a', 'b']);
    expect(g.getNodes()[0]?.attributes.values).toEqual([['shape', 'box']]);
  });

  it('renders as the source does', { tags: ['process'] }, ({ skip }) => {
    skip(
      spawnSync('dot', ['-V'], { timeout: 10_000 }).status !== 0,
      'dot is not installed',
    );
    const dot = 'digraph { a [color=red, label=x]; a [shape=box] }';
    const canon = (s: string) => {
      const r = spawnSync('dot', ['-Tcanon'], {
        input: s,
        encoding: 'utf8',
        timeout: 30_000,
      });
      expect(r.status, `${s}\n${r.stderr}`).toBe(0);
      return r.stdout;
    };
    expect(canon(toDot(fromDot(dot)))).toBe(canon(dot));
  });
});
