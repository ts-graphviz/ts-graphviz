import { describe, expect, it } from 'vitest';
import { createCommandArgs, escapeValue } from './create-command-args.js';

describe('escapeValue', () => {
  it('writes the value verbatim: argv needs no quoting (#1592)', () => {
    expect(escapeValue('a b')).toBe('=a b');
    expect(escapeValue('say "hi"')).toBe('=say "hi"');
    expect(escapeValue('back\\slash')).toBe('=back\\slash');
    expect(escapeValue(1.5)).toBe('=1.5');
    expect(escapeValue(false)).toBe('=false');
    expect(escapeValue(true)).toBe('');
  });

  it('is used for graph, node and edge attributes', () => {
    const args = [
      ...createCommandArgs({
        attributes: {
          graph: { label: 'a b' },
          node: { shape: 'box' },
          edge: { label: 'say "hi"' },
        },
      }),
    ];
    expect(args).toContain('-Glabel=a b');
    expect(args).toContain('-Nshape=box');
    expect(args).toContain('-Elabel=say "hi"');
  });
});

describe('fdp -L flags (#1591)', () => {
  it('emits nothing for the Graphviz defaults (grid on, old attractive off)', () => {
    const args = [...createCommandArgs({ layout: 'fdp' })];
    expect(args.filter((a) => a.startsWith('-L'))).toStrictEqual([]);
  });

  it('turns the grid off with -Lg and the old attractive force on with -LO', () => {
    expect([...createCommandArgs({ layout: 'fdp', grid: false })]).toContain(
      '-Lg',
    );
    expect([
      ...createCommandArgs({ layout: 'fdp', oldAttractive: true }),
    ]).toContain('-LO');
    const both = [
      ...createCommandArgs({ layout: 'fdp', grid: false, oldAttractive: true }),
    ];
    expect(both).toContain('-Lg');
    expect(both).toContain('-LO');
    expect([
      ...createCommandArgs({ layout: 'fdp', grid: true, oldAttractive: false }),
    ]).not.toContainEqual(expect.stringMatching(/^-L[gO]*$/));
  });
});
