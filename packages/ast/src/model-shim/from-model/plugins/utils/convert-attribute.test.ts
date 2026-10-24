import { htmlLike } from '@ts-graphviz/common';
import { describe, expect, test } from 'vitest';
import { createElement } from '../../../../builder/create-element.js';
import { convertAttribute } from './convert-attribute.js';

describe('convertAttribute', () => {
  test('number', () => {
    const result = convertAttribute(createElement, 'size', 1);
    expect(result).toMatchInlineSnapshot(`
      {
        "key": {
          "quoted": false,
          "type": "Literal",
          "value": "size",
        },
        "type": "Attribute",
        "value": {
          "quoted": false,
          "type": "Literal",
          "value": "1",
        },
      }
    `);
  });

  describe('string', () => {
    test('quoted string literal', () => {
      const result = convertAttribute(createElement, 'label', 'A');
      expect(result).toMatchInlineSnapshot(`
        {
          "key": {
            "quoted": false,
            "type": "Literal",
            "value": "label",
          },
          "type": "Attribute",
          "value": {
            "quoted": true,
            "type": "Literal",
            "value": "A",
          },
        }
      `);
    });

    describe('html-like', () => {
      test('simple HTML-like label', () => {
        const result = convertAttribute(createElement, 'label', htmlLike('A'));
        expect(result).toMatchInlineSnapshot(`
          {
            "key": {
              "quoted": false,
              "type": "Literal",
              "value": "label",
            },
            "type": "Attribute",
            "value": {
              "quoted": "html",
              "type": "Literal",
              "value": "A",
            },
          }
        `);
      });
      test('nested HTML-like label', () => {
        const result = convertAttribute(
          createElement,
          'label',
          htmlLike('<b>Hi</b>'),
        );
        expect(result).toMatchInlineSnapshot(`
          {
            "key": {
              "quoted": false,
              "type": "Literal",
              "value": "label",
            },
            "type": "Attribute",
            "value": {
              "quoted": "html",
              "type": "Literal",
              "value": "<b>Hi</b>",
            },
          }
        `);
      });

      // Additional edge-case tests for whitespace and malformed HTML-like values
      test('HTML-like label with surrounding whitespace', () => {
        const result = convertAttribute(createElement, 'label', '  <A>  ');
        expect(result).toMatchInlineSnapshot(`
          {
            "key": {
              "quoted": false,
              "type": "Literal",
              "value": "label",
            },
            "type": "Attribute",
            "value": {
              "quoted": true,
              "type": "Literal",
              "value": "  <A>  ",
            },
          }
        `);
      });

      test('malformed HTML-like missing closing bracket', () => {
        const result = convertAttribute(createElement, 'label', '<A');
        expect(result).toMatchInlineSnapshot(`
          {
            "key": {
              "quoted": false,
              "type": "Literal",
              "value": "label",
            },
            "type": "Attribute",
            "value": {
              "quoted": true,
              "type": "Literal",
              "value": "<A",
            },
          }
        `);
      });

      test('malformed HTML-like missing opening bracket', () => {
        const result = convertAttribute(createElement, 'label', 'A>');
        expect(result).toMatchInlineSnapshot(`
          {
            "key": {
              "quoted": false,
              "type": "Literal",
              "value": "label",
            },
            "type": "Attribute",
            "value": {
              "quoted": true,
              "type": "Literal",
              "value": "A>",
            },
          }
        `);
      });
    });
  });
});
