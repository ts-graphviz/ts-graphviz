import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { ArrowType } from './types.js';

// Graphviz's table of arrow shapes (doc/info/arrows.html), written out:
// the shapes, and the modifiers each one takes.
const TABLE = {
  box: ['', 'o', 'l', 'r', 'ol', 'or'],
  crow: ['', 'l', 'r'],
  curve: ['', 'l', 'r'],
  diamond: ['', 'o', 'l', 'r', 'ol', 'or'],
  dot: ['', 'o'],
  icurve: ['', 'l', 'r'],
  inv: ['', 'o', 'l', 'r', 'ol', 'or'],
  none: [''],
  normal: ['', 'o', 'l', 'r', 'ol', 'or'],
  tee: ['', 'l', 'r'],
  vee: ['', 'l', 'r'],
};
const ANAMES = Object.entries(TABLE).flatMap(([shape, modifiers]) =>
  modifiers.map((modifier) => `${modifier}${shape}` as ArrowType.aname),
);
const LAST = ANAMES.filter((name) => name !== 'none');

function rejects(...shapes: readonly unknown[]): void {
  expect(() =>
    ArrowType.build(...(shapes as unknown as ArrowType.Shapes)),
  ).toThrow(
    expect.objectContaining({
      name: 'RangeError',
      code: 'TSG_ERR_INVALID_ARROW',
    }),
  );
}

describe('ArrowType.build', () => {
  it('takes the 42 shapes of Graphviz’s table', () => {
    expect(ANAMES).toHaveLength(42);
    for (const name of ANAMES) expect(ArrowType.build(name)).toBe(name);
  });

  it('rejects modifiers a shape does not take', () => {
    const modifiers = ['', 'o', 'l', 'r', 'ol', 'or'];
    const all = Object.keys(TABLE).flatMap((shape) =>
      modifiers.map((modifier) => `${modifier}${shape}`),
    );
    const rejected = all.filter((name) => !ANAMES.includes(name as never));
    expect(rejected).toContain('ldot');
    expect(rejected).toContain('ocrow');
    expect(rejected).toContain('onone');
    for (const name of rejected) rejects(name);
  });

  it('joins up to four shapes, the last of two or more not none', () => {
    expect(ArrowType.build('obox', 'ltee', 'vee')).toBe('oboxlteevee');
    expect(ArrowType.build('none', 'none', 'dot', 'olnormal')).toBe(
      'nonenonedotolnormal',
    );
    expect(ArrowType.build('none')).toBe('none');
    rejects('dot', 'none');
    rejects('dot', 'dot', 'dot', 'dot', 'dot');
    rejects();
  });

  it('rejects what is not a shape name', () => {
    rejects('nope');
    rejects('odot ');
    rejects('Dot');
    rejects('dotdot');
    rejects(1);
    rejects(undefined);
    rejects({ toString: () => 'dot' });
  });

  it('gives the shapes joined for any valid sequence', () => {
    const shapes = fc
      .tuple(
        fc.array(fc.constantFrom(...ANAMES), { maxLength: 3 }),
        fc.constantFrom(...LAST),
      )
      .map(([init, last]) => [...init, last]);
    fc.assert(
      fc.property(shapes, (names) => {
        expect(ArrowType.build(...(names as unknown as ArrowType.Shapes))).toBe(
          names.join(''),
        );
      }),
    );
  });

  it('cannot be replaced', () => {
    expect(Object.isFrozen(ArrowType)).toBe(true);
  });
});
