import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { isStyleList } from './style.js';

// The regular expression the scanner replaces, as the reference for short
// values (it takes quadratic time on long ones).
const STYLE_ITEM =
  /[ \t]*(?:([A-Za-z]+)|setlinewidth[ \t]*\([ \t]*(?:\d+\.?\d*|\.\d+)[ \t]*\))[ \t]*(?:,|$)/y;
const NAMES =
  /^(?:solid|dashed|dotted|bold|invis|invisible|filled|rounded|diagonals|striped|wedged|radial|tapered)$/i;
function reference(value: string): boolean {
  let i = 0;
  while (i < value.length) {
    STYLE_ITEM.lastIndex = i;
    const match = STYLE_ITEM.exec(value);
    if (!match || STYLE_ITEM.lastIndex === i) return false;
    if (match[1] !== undefined && !NAMES.test(match[1])) return false;
    i = STYLE_ITEM.lastIndex;
  }
  return true;
}

// Values built from whole items and from the pieces of the style syntax,
// so that some are style lists and the rest fail at every kind of position.
const piece = fc.constantFrom(
  'solid',
  'Bold',
  'filled',
  'setlinewidth',
  'setlinewidthx',
  'unknown',
  '(',
  ')',
  '1',
  '25',
  '.',
  ',',
  ' ',
  '\t',
  ';',
);
const item = fc.oneof(
  fc.constantFrom('solid', 'Bold', 'filled', 'unknown', 'setlinewidth'),
  fc
    .tuple(
      fc.constantFrom('', ' '),
      fc.constantFrom('1', '1.', '1.5', '.5', '.', '', '1x'),
      fc.constantFrom('', ' '),
    )
    .map(([a, n, b]) => `setlinewidth${a}(${a}${n}${b})`),
);
const value = fc.oneof(
  fc.array(item, { minLength: 1, maxLength: 4 }).chain((items) =>
    fc
      .array(fc.constantFrom(',', ', ', ' ,', ',\t'), {
        minLength: items.length,
        maxLength: items.length,
      })
      .map((seps) => items.map((it, i) => (i ? seps[i] : '') + it).join('')),
  ),
  fc
    .array(piece, { minLength: 1, maxLength: 12 })
    .map((pieces) => pieces.join('')),
);

describe('isStyleList', () => {
  it('accepts what the regular expression it replaces accepts', () => {
    // Measured over 5 seeds × 2000 values: none is empty, about 82% are
    // distinct, 17% are style lists (half of those with setlinewidth, half
    // with several items), and 28% fail inside a setlinewidth(…).
    fc.assert(
      fc.property(value, (v) => {
        expect(isStyleList(v)).toBe(reference(v));
      }),
      { numRuns: 2000 },
    );
  });

  it.each([
    ['solid', true],
    ['dashed, bold', true],
    ['setlinewidth(2)', true],
    ['setlinewidth ( .5 ) ,filled', true],
    ['solid,', true],
    ['', true],
    ['setlinewidth(1.)', true],
    ['setlinewidth(.)', false],
    ['setlinewidth()', false],
    ['SETLINEWIDTH(1)', false],
    ['setlinewidth', false],
    ['solid,,bold', false],
    ['solid bold', false],
  ])('%j → %s', (input, expected) => {
    expect(isStyleList(input)).toBe(expected);
  });

  it('takes linear time on long values', () => {
    const inputs = [
      `setlinewidth(${'1'.repeat(1_000_000)}`,
      `setlinewidth(${'1'.repeat(1_000_000)})`,
      `${'solid,'.repeat(170_000)}x`,
      `${' '.repeat(1_000_000)}x`,
      `solid${' '.repeat(1_000_000)}x`,
    ];
    for (const input of inputs) {
      const start = performance.now();
      isStyleList(input);
      expect(performance.now() - start).toBeLessThan(1000);
    }
  });
});
