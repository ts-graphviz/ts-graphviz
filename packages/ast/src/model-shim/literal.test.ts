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

describe('literal text', () => {
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
      quoted: false,
    });
    expect(literalFromKey('a"b')).toStrictEqual({
      value: 'a\\"b',
      quoted: true,
    });
    expect(literalFromKey('1st')).toStrictEqual({ value: '1st', quoted: true });
    // DOT keywords cannot appear bare, even as attribute names
    expect(literalFromKey('node')).toStrictEqual({
      value: 'node',
      quoted: true,
    });
    expect(literalFromKey('Graph')).toStrictEqual({
      value: 'Graph',
      quoted: true,
    });
  });

  it('round-trips through literalFromValue / valueFromLiteral', () => {
    for (const text of ['', 'x', 'a\\"b', '\\\\"a', '<b>x</b>', 'a\nb']) {
      expect(valueFromLiteral(literalFromValue(text))).toBe(text);
    }
  });

  it('treats ids as literal text', () => {
    expect(idToRaw('a"b')).toBe('a\\"b');
    expect(idFromLiteral({ value: 'a\\"b', quoted: true })).toBe('a"b');
    expect(idFromLiteral({ value: 'bare', quoted: false })).toBe('bare');
  });
});

describe('escString', () => {
  it('is written as is, with only quotes escaped', () => {
    expect(literalFromValue(escString('\\N\\lleft'))).toStrictEqual({
      value: '\\N\\lleft',
      quoted: true,
    });
    expect(literalFromValue(escString('say "hi"'))).toStrictEqual({
      value: 'say \\"hi\\"',
      quoted: true,
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
    expect(sanitized).toStrictEqual({ value: '\\N\\"', quoted: true });
    expect(valueFromLiteral(sanitized)).toStrictEqual(escString('\\N\\"'));
    // without a Graphviz escape the kind is not recoverable from DOT text
    expect(valueFromLiteral(literalFromValue(escString('plain')))).toBe(
      'plain',
    );
  });

  it('is recognised when parsing a Graphviz escape sequence', () => {
    expect(valueFromLiteral({ value: '\\N', quoted: true })).toStrictEqual(
      escString('\\N'),
    );
    expect(valueFromLiteral({ value: 'a\\lb', quoted: true })).toStrictEqual(
      escString('a\\lb'),
    );
    // `\\` `\"` `\n` `\r` alone are literal text
    expect(valueFromLiteral({ value: 'a\\\\b\\"c\\n', quoted: true })).toBe(
      'a\\b"c\n',
    );
  });
});

describe('HTML-like', () => {
  it('maps to and from an html literal', () => {
    expect(literalFromValue(htmlLike('<b>x</b>'))).toStrictEqual({
      value: '<b>x</b>',
      quoted: 'html',
    });
    expect(
      valueFromLiteral({ value: '<b>x</b>', quoted: 'html' }),
    ).toStrictEqual(htmlLike('<b>x</b>'));
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
      quoted: true,
    });
  });
});

describe('numbers and booleans', () => {
  it('writes numbers that are not DOT numerals as strings', () => {
    // DOT numerals have no exponent, and NaN / Infinity would be identifiers
    expect(literalFromValue(1e21)).toStrictEqual({
      value: '1e+21',
      quoted: true,
    });
    expect(literalFromValue(1e-7)).toStrictEqual({
      value: '1e-7',
      quoted: true,
    });
    expect(literalFromValue(Number.NaN)).toStrictEqual({
      value: 'NaN',
      quoted: true,
    });
    expect(literalFromValue(Number.NEGATIVE_INFINITY)).toStrictEqual({
      value: '-Infinity',
      quoted: true,
    });
    expect(literalFromValue(-0.5)).toStrictEqual({
      value: '-0.5',
      quoted: false,
    });
  });

  it('are written unquoted', () => {
    expect(literalFromValue(1.5)).toStrictEqual({
      value: '1.5',
      quoted: false,
    });
    expect(literalFromValue(true)).toStrictEqual({
      value: 'true',
      quoted: false,
    });
  });

  it('are read back typed from bare literals', () => {
    expect(valueFromLiteral({ value: '1.5', quoted: false })).toBe(1.5);
    expect(valueFromLiteral({ value: '-0.5', quoted: false })).toBe(-0.5);
    expect(valueFromLiteral({ value: '7', quoted: false })).toBe(7);
    expect(valueFromLiteral({ value: 'true', quoted: false })).toBe(true);
    expect(valueFromLiteral({ value: 'false', quoted: false })).toBe(false);
  });

  it('round-trip through literalFromValue / valueFromLiteral', () => {
    for (const value of [0, 7, -1, 1.5, -0.5, 100.25, true, false]) {
      expect(valueFromLiteral(literalFromValue(value))).toBe(value);
    }
  });

  it('do not apply to quoted strings or other bare ids', () => {
    expect(valueFromLiteral({ value: '1.5', quoted: true })).toBe('1.5');
    expect(valueFromLiteral({ value: 'true', quoted: true })).toBe('true');
    expect(valueFromLiteral({ value: 'True', quoted: false })).toBe('True');
    expect(valueFromLiteral({ value: 'foo', quoted: false })).toBe('foo');
    expect(valueFromLiteral({ value: '1e5', quoted: false })).toBe('1e5');
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
      expect(valueFromLiteral({ value: text, quoted: false })).toBe(text);
    }
  });
});
