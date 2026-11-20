import fc from 'fast-check';
import { describe, expect, it, test } from 'vitest';
import { createElement } from '../../../../builder/create-element.js';
import { unescapeLiteral } from '../../../../model-shim/literal.js';
import { parse } from '../../../parser/parse.js';
import { stringify } from '../../stringify.js';
import { isBareId } from './bare-id.js';

/** Text made of the characters that decide where an ID ends. */
const idLikeText = fc.oneof(
  fc.string({
    unit: fc.constantFrom(...'aZ_09.-$ "\\:;[]{}=#/\t\n', 'é', '中', ' ', '😀'),
    maxLength: 6,
  }),
  fc.constantFrom('node', 'EDGE', 'Graph', 'digraph', 'subGraph', 'strict'),
  fc
    .tuple(
      fc.constantFrom('node', 'edge', 'strict', '1', '-.5', '1.'),
      fc.constantFrom('', 'x', '1', '_', 'abc'),
    )
    .map(([a, b]) => a + b),
);

const node = (value: string) =>
  createElement(
    'Node',
    { id: createElement('Literal', { value, kind: 'bare' }, []) },
    [],
  );

describe('isBareId', () => {
  test.each([
    ['a', true],
    ['_1', true],
    ['é', true],
    ['nodes', true],
    ['-1', true],
    ['.5', true],
    ['1.', true],
    ['node', false],
    ['Edge', false],
    ['STRICT', false],
    ['1abc', false],
    ['1.5.2', false],
    ['-', false],
    ['', false],
    ['a b', false],
    ['a\n', false],
    // The parser reads `$` in an ID; Graphviz does not.
    ['$a', false],
  ])('%j is %s', (value, expected) => {
    expect(isBareId(value)).toBe(expected);
  });
});

describe('a bare literal', { tags: ['SM-2'] }, () => {
  test.each([
    ['edge', '"edge"'],
    ['1abc', '"1abc"'],
    ['', '""'],
    ['a b', '"a b"'],
    ['$a', '"$a"'],
    ['a"b\\c\nd', '"a\\"b\\\\c\\nd"'],
    ['a', 'a'],
    ['-1.5', '-1.5'],
  ])('%j is written as %s', (value, expected) => {
    expect(
      stringify(createElement('Literal', { value, kind: 'bare' }, [])),
    ).toBe(expected);
  });

  it('with a null character cannot be written', () => {
    expect(() =>
      stringify(createElement('Literal', { value: 'a\0', kind: 'bare' }, [])),
    ).toThrow(expect.objectContaining({ code: 'TSG_ERR_NUL_CHARACTER' }));
  });

  it('is read back as the same text, bare only when it is one ID', () => {
    fc.assert(
      fc.property(idLikeText, (value) => {
        const { id } = parse(stringify(node(value)), { as: 'Node' });
        if (isBareId(value)) {
          expect(id).toMatchObject({ value, kind: 'bare' });
        } else {
          expect(id.kind).toBe('quoted');
          expect(unescapeLiteral(id.value)).toBe(value);
        }
      }),
    );
  });

  it('written bare where it is not one ID would not be read as that ID', () => {
    fc.assert(
      fc.property(
        // `$` is left out: the parser reads it in an ID, Graphviz does not.
        idLikeText.filter((value) => !isBareId(value) && !value.includes('$')),
        (value) => {
          let id: unknown;
          try {
            id = parse(value, { as: 'Node' }).id;
          } catch {
            return;
          }
          expect(id).not.toMatchObject({ value, kind: 'bare' });
        },
      ),
    );
  });
});
