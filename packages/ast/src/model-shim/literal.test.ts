import { escString, htmlLike } from '@ts-graphviz/common';
import { describe, expect, it } from 'vitest';
import {
  escapeLiteral,
  idFromLiteral,
  idToRaw,
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
    ['nul\0byte', 'nulbyte'],
  ])('escapes %j as %j and unescapes it back', (text, raw) => {
    expect(escapeLiteral(text)).toBe(raw);
    expect(unescapeLiteral(raw)).toBe(text.replace(/\0/g, ''));
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
  ])('sanitizes %j to %j so it cannot break out of the string', (raw, safe) => {
    expect(sanitizeEscString(raw)).toBe(safe);
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

  it('no longer guesses from the shape of a string', () => {
    expect(literalFromValue('<b>x</b>')).toStrictEqual({
      value: '<b>x</b>',
      quoted: true,
    });
  });
});

describe('numbers and booleans', () => {
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
});
