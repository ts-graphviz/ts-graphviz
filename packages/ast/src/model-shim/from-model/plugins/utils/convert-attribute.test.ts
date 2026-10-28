import { htmlLike } from '@ts-graphviz/common';
import { describe, expect, test } from 'vitest';
import { createElement } from '../../../../builder/create-element.js';
import { convertAttribute } from './convert-attribute.js';

describe('convertAttribute', () => {
  test('builds an Attribute node with a bare key and a bare number', () => {
    expect(convertAttribute(createElement, 'size', 1)).toMatchObject({
      type: 'Attribute',
      key: { type: 'Literal', kind: 'bare', value: 'size' },
      value: { type: 'Literal', kind: 'bare', value: '1' },
    });
  });

  describe('a plain string is always quoted, whatever it looks like', () => {
    test.each([
      ['plain text', 'A'],
      ['markup', '<b>Hi</b>'],
      ['markup with surrounding whitespace', '  <A>  '],
      ['an unclosed bracket', '<A'],
      ['an unopened bracket', 'A>'],
    ])('%s', (_, value) => {
      expect(convertAttribute(createElement, 'label', value)).toMatchObject({
        value: { type: 'Literal', kind: 'quoted', value },
      });
    });
  });

  describe('an htmlLike() value becomes an HTML string', () => {
    test.each([
      ['plain text', 'A'],
      ['nested markup', '<b>Hi</b>'],
    ])('%s', (_, markup) => {
      expect(
        convertAttribute(createElement, 'label', htmlLike(markup)),
      ).toMatchObject({
        value: { type: 'Literal', kind: 'html', value: markup },
      });
    });
  });
});
