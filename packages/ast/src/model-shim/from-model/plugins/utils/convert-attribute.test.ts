import { describe, expect, test } from 'vitest';
import { convertAttribute } from './convert-attribute.js';

describe('convertAttribute', () => {
  test('number', () => {
    const result = convertAttribute('size', 1);
    expect(result).toMatchInlineSnapshot(`
      {
        "children": [],
        "key": {
          "children": [],
          "location": null,
          "quoted": false,
          "type": "Literal",
          "value": "size",
        },
        "location": null,
        "type": "Attribute",
        "value": {
          "children": [],
          "location": null,
          "quoted": false,
          "type": "Literal",
          "value": "1",
        },
      }
    `);
  });

  describe('string', () => {
    test('quoted string literal', () => {
      const result = convertAttribute('label', 'A');
      expect(result).toMatchInlineSnapshot(`
        {
          "children": [],
          "key": {
            "children": [],
            "location": null,
            "quoted": false,
            "type": "Literal",
            "value": "label",
          },
          "location": null,
          "type": "Attribute",
          "value": {
            "children": [],
            "location": null,
            "quoted": true,
            "type": "Literal",
            "value": "A",
          },
        }
      `);
    });

    describe('html-like', () => {
      test('simple HTML-like label', () => {
        const result = convertAttribute('label', '<A>');
        expect(result).toMatchInlineSnapshot(`
          {
            "children": [],
            "key": {
              "children": [],
              "location": null,
              "quoted": false,
              "type": "Literal",
              "value": "label",
            },
            "location": null,
            "type": "Attribute",
            "value": {
              "children": [],
              "location": null,
              "quoted": "html",
              "type": "Literal",
              "value": "A",
            },
          }
        `);
      });
      test('nested HTML-like label', () => {
        const result = convertAttribute('label', '<<b>Hi</b>>');
        expect(result).toMatchInlineSnapshot(`
          {
            "children": [],
            "key": {
              "children": [],
              "location": null,
              "quoted": false,
              "type": "Literal",
              "value": "label",
            },
            "location": null,
            "type": "Attribute",
            "value": {
              "children": [],
              "location": null,
              "quoted": "html",
              "type": "Literal",
              "value": "<b>Hi</b>",
            },
          }
        `);
      });

      // Additional edge-case tests for whitespace and malformed HTML-like values
      test('HTML-like label with surrounding whitespace', () => {
        const result = convertAttribute('label', '  <A>  ');
        expect(result).toMatchInlineSnapshot(`
          {
            "children": [],
            "key": {
              "children": [],
              "location": null,
              "quoted": false,
              "type": "Literal",
              "value": "label",
            },
            "location": null,
            "type": "Attribute",
            "value": {
              "children": [],
              "location": null,
              "quoted": "html",
              "type": "Literal",
              "value": "A",
            },
          }
        `);
      });

      test('malformed HTML-like missing closing bracket', () => {
        const result = convertAttribute('label', '<A');
        expect(result).toMatchInlineSnapshot(`
          {
            "children": [],
            "key": {
              "children": [],
              "location": null,
              "quoted": false,
              "type": "Literal",
              "value": "label",
            },
            "location": null,
            "type": "Attribute",
            "value": {
              "children": [],
              "location": null,
              "quoted": true,
              "type": "Literal",
              "value": "<A",
            },
          }
        `);
      });

      test('malformed HTML-like missing opening bracket', () => {
        const result = convertAttribute('label', 'A>');
        expect(result).toMatchInlineSnapshot(`
          {
            "children": [],
            "key": {
              "children": [],
              "location": null,
              "quoted": false,
              "type": "Literal",
              "value": "label",
            },
            "location": null,
            "type": "Attribute",
            "value": {
              "children": [],
              "location": null,
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
