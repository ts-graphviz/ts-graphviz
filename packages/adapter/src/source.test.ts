import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { attributeArgs } from './create-command-args.js';
import { sourceToRender } from './source.js';

const dot = 'digraph { a }';
const reject = (attributes: Parameters<typeof attributeArgs>[0]) =>
  expect(() => sourceToRender(dot, { attributes })).toThrow(
    expect.objectContaining({
      name: 'SecurityError',
      code: 'TSG_ERR_UNSAFE_DOT',
    }),
  );

describe('attributes passed as arguments', { tags: ['SM-4'] }, () => {
  it('rejects a line break in an argument, also after a backslash', () => {
    // A backslash before a line break is a line continuation in a DOT
    // string, so the line break never reached the check before.
    reject({ graph: { label: 'a\\\nb' } });
    reject({ node: { label: 'a\\\r\nb' } });
    reject({ edge: { label: 'a\nb' } });
    reject({ graph: { 'label\\\nx': 'y' } as never });
  });

  it('rejects a backslash that the DOT copy would read as an escape', () => {
    reject({ graph: { label: 'abc\\' } });
    reject({ graph: { label: 'a\\"b' } });
    reject({ graph: { 'label\\': 'x' } as never });
  });

  it('accepts what has no line break', () => {
    expect(() =>
      sourceToRender(dot, {
        attributes: {
          graph: { label: 'a \\l "b" \\=c', center: true },
          node: { shape: 'box' },
          edge: { color: 'red' },
        },
      }),
    ).not.toThrow();
  });

  it('checks every argument through a copy that parses', () => {
    // Keys and values made of the characters that matter to a DOT string:
    // whatever they are, the check accepts them or rejects them as unsafe,
    // never because its own DOT copy does not parse. Measured over 3 seeds
    // × 500: 55% hold a backslash, 71% are accepted, the rest are rejected
    // for a backslash the copy cannot hold.
    const text = fc.string({
      unit: fc.oneof(
        { weight: 6, arbitrary: fc.constantFrom('a', ' ', '"', '=', 'l') },
        { weight: 1, arbitrary: fc.constant('\\') },
      ),
      maxLength: 8,
    });
    const key = fc.oneof(
      { weight: 3, arbitrary: fc.constant('label') },
      { weight: 1, arbitrary: text },
    );
    fc.assert(
      fc.property(
        fc.dictionary(key, text, { minKeys: 1, maxKeys: 2 }),
        (graph) => {
          try {
            sourceToRender(dot, { attributes: { graph } as never });
          } catch (e) {
            expect(e).toMatchObject({ name: 'SecurityError' });
          }
        },
      ),
      { numRuns: 500 },
    );
  });
});
