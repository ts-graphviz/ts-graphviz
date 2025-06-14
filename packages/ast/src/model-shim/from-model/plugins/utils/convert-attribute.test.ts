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
    test('quated', () => {
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
      test('html', () => {
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
    });
  });
});
