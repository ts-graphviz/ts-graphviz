import { fromDot, toDot } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

describe('attribute order through the model (#1626)', () => {
  it('keeps integer-like keys where the DOT source put them', () => {
    const source = [
      'graph {',
      '  a = 1;',
      '  0 = 2;',
      '  node [',
      '    b = 1,',
      '    12 = 2,',
      '  ];',
      '  x [',
      '    c = 1,',
      '    3 = 2,',
      '  ];',
      '  x -- y [',
      '    d = 1,',
      '    4 = 2,',
      '  ];',
      '}',
      '',
    ].join('\n');
    const once = toDot(fromDot(source));
    const keysInOrder = [...once.matchAll(/^\s*"?([\w]+)"? = /gm)].map(
      (m) => m[1],
    );
    expect(keysInOrder).toStrictEqual([
      'a',
      '0',
      'b',
      '12',
      'c',
      '3',
      'd',
      '4',
    ]);
    expect(toDot(fromDot(once))).toBe(once);
  });

  it('treats a __proto__ key as an ordinary attribute', () => {
    const g = fromDot('graph { x [__proto__ = "v"]; }');
    expect(g.getNode('x')?.attributes.values).toStrictEqual([
      ['__proto__', 'v'],
    ]);
  });
});
