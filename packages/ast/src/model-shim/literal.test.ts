import { escString, type HTMLLikeValue, htmlLike } from '@ts-graphviz/common';
import { describe, expect, it } from 'vitest';
import {
  escapeLiteral,
  idFromLiteral,
  idToRaw,
  literalFromKey,
  literalFromValue,
  sanitizeEscString,
  unescapeLiteral,
  valueFromLiteral,
} from './literal.js';

describe('[SM-2] literal text', () => {
  it.each([
    ['plain', 'plain'],
    ['a"b', 'a\\"b'],
    ['a\\b', 'a\\\\b'],
    ['a\\', 'a\\\\'],
    ['\\"', '\\\\\\"'],
    ['one\ntwo', 'one\\ntwo'],
    ['one\r\ntwo', 'one\\r\\ntwo'],
  ])('escapes %j as %j and unescapes it back', (text, raw) => {
    expect(escapeLiteral(text)).toBe(raw);
    expect(unescapeLiteral(raw)).toBe(text);
  });

  it('rejects a null character instead of silently dropping it', () => {
    // dropping it would make the ids `a\0b` and `ab` collide
    expect(() => escapeLiteral('a\0b')).toThrow(RangeError);
    expect(() => idToRaw('a\0b')).toThrow(RangeError);
  });

  it('writes attribute keys bare when they are identifiers, quoted otherwise', () => {
    expect(literalFromKey('label')).toStrictEqual({
      value: 'label',
      kind: 'bare',
    });
    expect(literalFromKey('a"b')).toStrictEqual({
      value: 'a\\"b',
      kind: 'quoted',
    });
    expect(literalFromKey('1st')).toStrictEqual({
      value: '1st',
      kind: 'quoted',
    });
    // DOT keywords cannot appear bare, even as attribute names
    expect(literalFromKey('node')).toStrictEqual({
      value: 'node',
      kind: 'quoted',
    });
    expect(literalFromKey('Graph')).toStrictEqual({
      value: 'Graph',
      kind: 'quoted',
    });
  });

  it('round-trips through literalFromValue / valueFromLiteral', () => {
    for (const text of ['', 'x', 'a\\"b', '\\\\"a', '<b>x</b>', 'a\nb']) {
      expect(valueFromLiteral(literalFromValue(text))).toBe(text);
    }
  });

  it('treats ids as literal text', () => {
    expect(idToRaw('a"b')).toBe('a\\"b');
    expect(idFromLiteral({ value: 'a\\"b', kind: 'quoted' })).toBe('a"b');
    expect(idFromLiteral({ value: 'bare', kind: 'bare' })).toBe('bare');
  });
});

describe('[SM-3] escString', () => {
  it('is written as is, with only quotes escaped', () => {
    expect(literalFromValue(escString('\\N\\lleft'))).toStrictEqual({
      value: '\\N\\lleft',
      kind: 'quoted',
    });
    expect(literalFromValue(escString('say "hi"'))).toStrictEqual({
      value: 'say \\"hi\\"',
      kind: 'quoted',
    });
  });

  it.each([
    ['\\"', '\\"'],
    ['\\\\"', '\\\\\\"'],
    ['a\\', 'a\\\\'],
    ['a\\\\', 'a\\\\'],
    ['a\\\\\\', 'a\\\\\\\\'],
    // raw line breaks become their escape sequence; a backslash before one
    // would otherwise be read as a line continuation
    ['x\ny', 'x\\ny'],
    ['a\\\nb', 'a\\\\\\nb'],
    ['a\\\\\nb', 'a\\\\\\nb'],
  ])('sanitizes %j to %j so it cannot break out of the string', (raw, safe) => {
    expect(sanitizeEscString(raw)).toBe(safe);
  });

  it('is canonicalised but keeps its meaning on a round trip', () => {
    const sanitized = literalFromValue(escString('\\N"'));
    expect(sanitized).toStrictEqual({ value: '\\N\\"', kind: 'quoted' });
    expect(valueFromLiteral(sanitized)).toStrictEqual(escString('\\N\\"'));
    // without a Graphviz escape the kind is not recoverable from DOT text
    expect(valueFromLiteral(literalFromValue(escString('plain')))).toBe(
      'plain',
    );
  });

  it('is recognised when parsing a Graphviz escape sequence', () => {
    expect(valueFromLiteral({ value: '\\N', kind: 'quoted' })).toStrictEqual(
      escString('\\N'),
    );
    expect(valueFromLiteral({ value: 'a\\lb', kind: 'quoted' })).toStrictEqual(
      escString('a\\lb'),
    );
    // `\\` `\"` `\n` `\r` alone are literal text
    expect(valueFromLiteral({ value: 'a\\\\b\\"c\\n', kind: 'quoted' })).toBe(
      'a\\b"c\n',
    );
  });
});

describe('[SM-3] HTML-like', () => {
  it('maps to and from an html literal', () => {
    expect(literalFromValue(htmlLike('<b>x</b>'))).toStrictEqual({
      value: '<b>x</b>',
      kind: 'html',
    });
    expect(valueFromLiteral({ value: '<b>x</b>', kind: 'html' })).toStrictEqual(
      htmlLike('<b>x</b>'),
    );
  });

  it('rejects markup whose angle brackets are not balanced', () => {
    // `<x>]; evil [label=<y>` would end the HTML string early
    expect(() => htmlLike('x>]; evil [label=<y')).toThrow(RangeError);
    expect(() => htmlLike('<b>a</b><')).toThrow(RangeError);
    // unbalanced *tags* are Graphviz's business; only the bracket count matters here
    expect(() => htmlLike('<b>unclosed')).not.toThrow();
    expect(() =>
      literalFromValue({ $$kind: 'html', value: 'x>' } as HTMLLikeValue),
    ).toThrow(RangeError);
  });

  it('no longer guesses from the shape of a string', () => {
    expect(literalFromValue('<b>x</b>')).toStrictEqual({
      value: '<b>x</b>',
      kind: 'quoted',
    });
  });
});

describe('[SM-2] numbers and booleans', () => {
  it('writes numbers that are not DOT numerals as strings', () => {
    // DOT numerals have no exponent, and NaN / Infinity would be identifiers
    expect(literalFromValue(1e21)).toStrictEqual({
      value: '1e+21',
      kind: 'quoted',
    });
    expect(literalFromValue(1e-7)).toStrictEqual({
      value: '1e-7',
      kind: 'quoted',
    });
    expect(literalFromValue(Number.NaN)).toStrictEqual({
      value: 'NaN',
      kind: 'quoted',
    });
    expect(literalFromValue(Number.NEGATIVE_INFINITY)).toStrictEqual({
      value: '-Infinity',
      kind: 'quoted',
    });
    expect(literalFromValue(-0.5)).toStrictEqual({
      value: '-0.5',
      kind: 'bare',
    });
  });

  it('are written unquoted', () => {
    expect(literalFromValue(1.5)).toStrictEqual({
      value: '1.5',
      kind: 'bare',
    });
    expect(literalFromValue(true)).toStrictEqual({
      value: 'true',
      kind: 'bare',
    });
  });

  it('are read back typed from bare literals', () => {
    expect(valueFromLiteral({ value: '1.5', kind: 'bare' })).toBe(1.5);
    expect(valueFromLiteral({ value: '-0.5', kind: 'bare' })).toBe(-0.5);
    expect(valueFromLiteral({ value: '7', kind: 'bare' })).toBe(7);
    expect(valueFromLiteral({ value: 'true', kind: 'bare' })).toBe(true);
    expect(valueFromLiteral({ value: 'false', kind: 'bare' })).toBe(false);
  });

  it('round-trip through literalFromValue / valueFromLiteral', () => {
    for (const value of [0, 7, -1, 1.5, -0.5, 100.25, true, false]) {
      expect(valueFromLiteral(literalFromValue(value))).toBe(value);
    }
  });

  it('do not apply to quoted strings or other bare ids', () => {
    expect(valueFromLiteral({ value: '1.5', kind: 'quoted' })).toBe('1.5');
    expect(valueFromLiteral({ value: 'true', kind: 'quoted' })).toBe('true');
    expect(valueFromLiteral({ value: 'True', kind: 'bare' })).toBe('True');
    expect(valueFromLiteral({ value: 'foo', kind: 'bare' })).toBe('foo');
    expect(valueFromLiteral({ value: '1e5', kind: 'bare' })).toBe('1e5');
  });

  it('keep numerals a number could not reproduce exactly as strings', () => {
    for (const text of [
      '001',
      '1.',
      '.5',
      '-.5',
      '1.0',
      '9007199254740993',
      '1000000000000000000000',
      '0.0000001',
    ]) {
      expect(valueFromLiteral({ value: text, kind: 'bare' })).toBe(text);
    }
  });
});
