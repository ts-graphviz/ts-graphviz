import { htmlLike } from '@ts-graphviz/common';
import { Digraph } from '@ts-graphviz/core';
import { describe, expect, it } from 'vitest';
import { fromDot } from './from-dot.js';
import { toDot } from './to-dot.js';

describe('[SM-3] value kinds in toDot', () => {
  it('writes an object shaped like an HTML-like value as a string', () => {
    const g = new Digraph();
    g.node('a', {
      label: JSON.parse('{"$$kind":"html","value":"<b>x</b>"}'),
    });
    expect(toDot(g)).not.toContain('<b>x</b>');
  });

  it('keeps HTML-like labels made by htmlLike and read by fromDot', () => {
    const g = new Digraph();
    g.node('a', { label: htmlLike('<b>x</b>') });
    const dot = toDot(g);
    expect(dot).toContain('label = <<b>x</b>>');
    expect(toDot(fromDot(dot))).toBe(dot);
  });
});
