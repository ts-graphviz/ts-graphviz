import { Digraph } from '@ts-graphviz/core';
import { describe, expect, it } from 'vitest';
import { fromDot } from './from-dot.js';
import { toDot } from './to-dot.js';

// Values typed as strings that are not strings at run time, as parsed JSON
// can hand them over.
const text = 'x" ]; extra [shape=box]; a [label="y';

describe('[SM-2] values that are not strings', () => {
  it.each([
    ['an array', [text]],
    ['an object', { toString: () => text }],
  ])('writes %s as its escaped text', (_, value) => {
    const g = new Digraph();
    g.node('a', { label: value as never });
    const dot = toDot(g);
    const back = fromDot(dot);
    expect(back.nodes.map((n) => n.id)).toStrictEqual(['a']);
    expect(back.getNode('a')?.attributes.get('label')).toBe(String(value));
  });

  it('writes an id that is not a string as its escaped text', () => {
    const g = new Digraph();
    g.createNode([text] as never);
    const back = fromDot(toDot(g));
    expect(back.nodes.map((n) => n.id)).toStrictEqual([text]);
  });

  it('quotes an array that looks like a number', () => {
    const g = new Digraph();
    g.node('a', { width: [123] as never });
    expect(toDot(g)).toContain('width = "123"');
  });

  it('throws the TypeError of a value that has no text', () => {
    const g = new Digraph();
    g.node('a', { label: Object.create(null) });
    expect(() => toDot(g)).toThrow(TypeError);
  });

  it('still writes numbers and booleans bare', () => {
    const g = new Digraph();
    g.node('a', { width: 1.5, fixedsize: true, height: Number.NaN });
    expect(toDot(g)).toContain('width = 1.5');
    expect(toDot(g)).toContain('fixedsize = true');
    expect(toDot(g)).toContain('height = "NaN"');
  });
});
