import { wrap } from 'jest-snapshot-serializer-raw';
import { pipe } from '../utils/functional.js';
import { stringify as _stringify } from './stringify.js';

const stringify = pipe(_stringify, wrap);

describe('stringify', () => {
  describe('literal', () => {
    test('quated', () => {
      expect(
        stringify({
          type: 'Literal',
          value: 'hoge',
          quoted: true,
          children: [],
        }),
      ).toMatchInlineSnapshot(`"hoge"`);
    });

    test('not quated', () => {
      expect(
        stringify({
          type: 'Literal',
          value: 'hoge',
          quoted: false,
          children: [],
        }),
      ).toMatchInlineSnapshot(`hoge`);
    });

    test('html label', () => {
      expect(
        stringify({
          type: 'Literal',
          value: 'hoge',
          quoted: 'html',
          children: [],
        }),
      ).toMatchInlineSnapshot(`<hoge>`);
    });
  });

  describe('attribyte', () => {
    test('simple', () => {
      expect(
        stringify({
          type: 'Literal',
          value: 'hoge',
          quoted: 'html',
          children: [],
        }),
      ).toMatchInlineSnapshot(`<hoge>`);
    });
  });

  describe('attribytes', () => {
    test('node', () => {
      expect(
        stringify({
          type: 'AttributeList',
          kind: 'Node',
          children: [],
        }),
      ).toMatchInlineSnapshot(`node [];`);
    });

    test('edge', () => {
      expect(
        stringify({
          type: 'AttributeList',
          kind: 'Edge',
          children: [],
        }),
      ).toMatchInlineSnapshot(`edge [];`);
    });

    test('graph', () => {
      expect(
        stringify({
          type: 'AttributeList',
          kind: 'Graph',
          children: [],
        }),
      ).toMatchInlineSnapshot(`graph [];`);
    });

    test('with attribute', () => {
      expect(
        stringify({
          type: 'AttributeList',
          kind: 'Node',
          children: [
            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
                children: [],
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
                children: [],
              },

              children: [],
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        node [
          color = hoge;
        ];
      `);
    });
    test('with two attributes', () => {
      expect(
        stringify({
          type: 'AttributeList',
          kind: 'Node',
          children: [
            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
                children: [],
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
                children: [],
              },

              children: [],
            },

            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'bgcolor',
                quoted: false,
                children: [],
              },

              value: {
                type: 'Literal',
                value: 'fuga',
                quoted: false,
                children: [],
              },

              children: [],
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        node [
          color = hoge;
          bgcolor = fuga;
        ];
      `);
    });
  });

  describe('node', () => {
    test('simple', () => {
      expect(
        stringify({
          type: 'Attribute',
          key: {
            type: 'Literal',
            value: 'color',
            quoted: false,
            children: [],
          },

          value: {
            type: 'Literal',
            value: 'hoge',
            quoted: false,
            children: [],
          },

          children: [],
        }),
      ).toMatchInlineSnapshot(`color = hoge;`);
    });

    test('with attribute', () => {
      expect(
        stringify({
          type: 'Node',
          children: [
            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
                children: [],
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
                children: [],
              },

              children: [],
            },
          ],

          id: {
            type: 'Literal',
            value: 'hoge',
            quoted: true,
            children: [],
          },
        }),
      ).toMatchInlineSnapshot(`
        "hoge" [
          color = hoge;
        ];
      `);
    });

    test('with two attributes', () => {
      expect(
        stringify({
          type: 'Node',
          children: [
            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
                children: [],
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
                children: [],
              },

              children: [],
            },

            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'bgcolor',
                quoted: false,
                children: [],
              },

              value: {
                type: 'Literal',
                value: 'fuga',
                quoted: false,
                children: [],
              },

              children: [],
            },
          ],

          id: {
            type: 'Literal',
            value: 'hoge',
            quoted: true,
            children: [],
          },
        }),
      ).toMatchInlineSnapshot(`
        "hoge" [
          color = hoge;
          bgcolor = fuga;
        ];
      `);
    });
  });

  describe('edge', () => {
    test('simple', () => {
      expect(
        stringify({
          type: 'Edge',
          targets: [
            {
              type: 'NodeRef',
              id: {
                type: 'Literal',
                value: 'id1',
                quoted: true,
                children: [],
              },

              port: {
                type: 'Literal',
                value: 'port1',
                quoted: true,
                children: [],
              },

              children: [],
            },

            {
              type: 'NodeRef',
              id: {
                type: 'Literal',
                value: 'id2',
                quoted: true,
                children: [],
              },

              compass: {
                type: 'Literal',
                value: 'w',
                quoted: false,
                children: [],
              },

              children: [],
            },
          ],

          children: [],
        }),
      ).toMatchInlineSnapshot(`"id1":"port1" -> "id2":w;`);
    });

    test('with attribute', () => {
      expect(
        stringify({
          type: 'Edge',
          targets: [
            {
              type: 'NodeRef',
              id: {
                type: 'Literal',
                value: 'id1',
                quoted: true,
                children: [],
              },

              port: {
                type: 'Literal',
                value: 'port1',
                quoted: true,
                children: [],
              },

              children: [],
            },

            {
              type: 'NodeRef',
              id: {
                type: 'Literal',
                value: 'id2',
                quoted: true,
                children: [],
              },

              compass: {
                type: 'Literal',
                value: 'w',
                quoted: false,
                children: [],
              },

              children: [],
            },
          ],

          children: [
            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
                children: [],
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
                children: [],
              },

              children: [],
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        "id1":"port1" -> "id2":w [
          color = hoge;
        ];
      `);
    });

    test('with two attributes', () => {
      expect(
        stringify({
          type: 'Edge',
          targets: [
            {
              type: 'NodeRef',
              id: {
                type: 'Literal',
                value: 'id1',
                quoted: true,
                children: [],
              },

              port: {
                type: 'Literal',
                value: 'port1',
                quoted: true,
                children: [],
              },

              children: [],
            },

            {
              type: 'NodeRef',
              id: {
                type: 'Literal',
                value: 'id2',
                quoted: true,
                children: [],
              },

              compass: {
                type: 'Literal',
                value: 'w',
                quoted: false,
                children: [],
              },

              children: [],
            },
          ],

          children: [
            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
                children: [],
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
                children: [],
              },

              children: [],
            },

            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
                children: [],
              },

              value: {
                type: 'Literal',
                value: 'fuga',
                quoted: false,
                children: [],
              },

              children: [],
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        "id1":"port1" -> "id2":w [
          color = hoge;
          color = fuga;
        ];
      `);
    });

    test('node ref group', () => {
      expect(
        stringify({
          type: 'Edge',
          targets: [
            {
              type: 'NodeRef',
              id: {
                type: 'Literal',
                value: 'id1',
                quoted: true,
                children: [],
              },

              port: {
                type: 'Literal',
                value: 'port1',
                quoted: true,
                children: [],
              },

              children: [],
            },

            {
              type: 'NodeRefGroup',
              children: [
                {
                  type: 'NodeRef',
                  id: {
                    type: 'Literal',
                    value: 'id2',
                    quoted: true,
                    children: [],
                  },

                  children: [],
                },

                {
                  type: 'NodeRef',
                  id: {
                    type: 'Literal',
                    value: 'id3',
                    quoted: true,
                    children: [],
                  },

                  children: [],
                },
              ],
            },
          ],

          children: [],
        }),
      ).toMatchInlineSnapshot(`"id1":"port1" -> {"id2" "id3"};`);
    });
  });

  describe('subgraph', () => {
    test('with id', () => {
      expect(
        stringify({
          type: 'Subgraph',
          id: {
            type: 'Literal',
            value: 'id1',
            quoted: true,
            children: [],
          },
          children: [],
        }),
      ).toMatchInlineSnapshot(`subgraph "id1" {}`);
    });

    test('no id', () => {
      expect(
        stringify({
          type: 'Subgraph',
          children: [],
        }),
      ).toMatchInlineSnapshot(`subgraph {}`);
    });

    test('with children', () => {
      expect(
        stringify({
          type: 'Subgraph',
          children: [
            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
                children: [],
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
                children: [],
              },
              children: [],
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        subgraph {
          color = hoge;
        }
      `);
    });
  });

  describe('graph', () => {
    test('directed', () => {
      expect(
        stringify({
          type: 'Graph',
          strict: false,
          directed: true,
          id: {
            type: 'Literal',
            value: 'id1',
            quoted: true,
            children: [],
          },
          children: [],
        }),
      ).toMatchInlineSnapshot(`digraph "id1" {}`);
    });

    test('strict directed', () => {
      expect(
        stringify({
          type: 'Graph',
          strict: true,
          directed: true,
          id: {
            type: 'Literal',
            value: 'id1',
            quoted: true,
            children: [],
          },

          children: [],
        }),
      ).toMatchInlineSnapshot(`strict digraph "id1" {}`);
    });

    test('graph', () => {
      expect(
        stringify({
          type: 'Graph',
          strict: false,
          directed: false,
          id: {
            type: 'Literal',
            value: 'id1',
            quoted: true,
            children: [],
          },

          children: [],
        }),
      ).toMatchInlineSnapshot(`graph "id1" {}`);
    });

    test('strict graph', () => {
      expect(
        stringify({
          type: 'Graph',
          strict: true,
          directed: false,
          id: {
            type: 'Literal',
            value: 'id1',
            quoted: true,
            children: [],
          },

          children: [],
        }),
      ).toMatchInlineSnapshot(`strict graph "id1" {}`);
    });

    test('no id', () => {
      expect(
        stringify({
          type: 'Graph',
          strict: false,
          directed: true,
          children: [],
        }),
      ).toMatchInlineSnapshot(`digraph {}`);
    });

    test('with children', () => {
      expect(
        stringify({
          type: 'Graph',
          strict: false,
          directed: true,
          children: [
            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
                children: [],
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
                children: [],
              },

              children: [],
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        digraph {
          color = hoge;
        }
      `);
    });
  });

  describe('comment', () => {
    test('block', () => {
      expect(
        stringify({
          type: 'Comment',
          kind: 'Block',
          value: 'test\ntest',
          children: [],
        }),
      ).toMatchInlineSnapshot(`
        /**
         * test
         * test
         */
      `);
    });

    test('macro', () => {
      expect(
        stringify({
          type: 'Comment',
          kind: 'Macro',
          value: 'foo\nbar',
          children: [],
        }),
      ).toMatchInlineSnapshot(`
        # foo
        # bar
      `);
    });

    test('slach', () => {
      expect(
        stringify({
          type: 'Comment',
          kind: 'Slash',
          value: 'foo\nbar',
          children: [],
        }),
      ).toMatchInlineSnapshot(`
        // foo
        // bar
      `);
    });
  });

  describe('dot', () => {
    test('slach', () => {
      expect(
        stringify({
          type: 'Dot',
          children: [
            {
              type: 'Comment',
              kind: 'Slash',
              value: 'foo\nbar',
              children: [],
            },

            {
              type: 'Graph',
              strict: false,
              directed: false,
              id: {
                type: 'Literal',
                value: 'id1',
                quoted: true,
                children: [],
              },

              children: [],
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        // foo
        // bar
        graph "id1" {}
      `);
    });
  });
});
