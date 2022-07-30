import { describe, test, expect } from 'vitest';
import { FileRange } from '@ts-graphviz/dot-ast';
import { stringify } from '../stringify.js';

describe('stringify', () => {
  const location: FileRange = {
    start: {
      offset: 0,
      line: 0,
      column: 0,
    },
    end: {
      offset: 0,
      line: 0,
      column: 0,
    },
  };

  describe('literal', () => {
    test('quated', () => {
      expect(
        stringify({
          type: 'Literal',
          value: 'hoge',
          quoted: true,
          location,
        }),
      ).toMatchInlineSnapshot('"\\"hoge\\""');
    });

    test('not quated', () => {
      expect(
        stringify({
          type: 'Literal',
          value: 'hoge',
          quoted: false,
          location,
        }),
      ).toMatchInlineSnapshot('"hoge"');
    });

    test('html label', () => {
      expect(
        stringify({
          type: 'Literal',
          value: 'hoge',
          quoted: 'html',
          location,
        }),
      ).toMatchInlineSnapshot('"<hoge>"');
    });
  });

  describe('attribyte', () => {
    test('simple', () => {
      expect(
        stringify({
          type: 'Literal',
          value: 'hoge',
          quoted: 'html',
          location,
        }),
      ).toMatchInlineSnapshot('"<hoge>"');
    });
  });

  describe('attribytes', () => {
    test('node', () => {
      expect(
        stringify({
          type: 'Attributes',
          kind: 'Node',
          body: [],
          location,
        }),
      ).toMatchInlineSnapshot('"Node;"');
    });

    test('edge', () => {
      expect(
        stringify({
          type: 'Attributes',
          kind: 'Edge',
          body: [],
          location,
        }),
      ).toMatchInlineSnapshot('"Edge;"');
    });

    test('graph', () => {
      expect(
        stringify({
          type: 'Attributes',
          kind: 'Graph',
          body: [],
          location,
        }),
      ).toMatchInlineSnapshot('"Graph;"');
    });

    test('with attribute', () => {
      expect(
        stringify({
          type: 'Attributes',
          kind: 'Node',
          body: [
            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
                location,
              },
              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
                location,
              },
              location,
            },
          ],
          location,
        }),
      ).toMatchInlineSnapshot(`
        "Node [
          color = hoge;
        ];"
      `);
    });
    test('with two attributes', () => {
      expect(
        stringify({
          type: 'Attributes',
          kind: 'Node',
          body: [
            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
                location,
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
                location,
              },

              location,
            },

            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'bgcolor',
                quoted: false,
                location,
              },

              value: {
                type: 'Literal',
                value: 'fuga',
                quoted: false,
                location,
              },

              location,
            },
          ],

          location,
        }),
      ).toMatchInlineSnapshot(`
        "Node [
          color = hoge;
          bgcolor = fuga;
        ];"
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
            location,
          },
          value: {
            type: 'Literal',
            value: 'hoge',
            quoted: false,
            location,
          },
          location,
        }),
      ).toMatchInlineSnapshot('"color = hoge;"');
    });

    test('with attribute', () => {
      expect(
        stringify({
          type: 'Node',
          body: [
            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
                location,
              },
              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
                location,
              },
              location,
            },
          ],
          id: {
            type: 'Literal',
            value: 'hoge',
            quoted: true,
            location,
          },
          location,
        }),
      ).toMatchInlineSnapshot(`
        "\\"hoge\\" [
          color = hoge;
        ];"
      `);
    });

    test('with two attributes', () => {
      expect(
        stringify({
          type: 'Node',
          body: [
            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
                location,
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
                location,
              },

              location,
            },

            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'bgcolor',
                quoted: false,
                location,
              },

              value: {
                type: 'Literal',
                value: 'fuga',
                quoted: false,
                location,
              },

              location,
            },
          ],

          id: {
            type: 'Literal',
            value: 'hoge',
            quoted: true,
            location,
          },

          location,
        }),
      ).toMatchInlineSnapshot(`
        "\\"hoge\\" [
          color = hoge;
          bgcolor = fuga;
        ];"
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
                location,
              },
              port: {
                type: 'Literal',
                value: 'port1',
                quoted: true,
                location,
              },
              location,
            },
            {
              type: 'NodeRef',
              id: {
                type: 'Literal',
                value: 'id2',
                quoted: true,
                location,
              },
              compass: {
                type: 'Literal',
                value: 'w',
                quoted: false,
                location,
              },
              location,
            },
          ],
          body: [],
          location,
        }),
      ).toMatchInlineSnapshot('"\\"id1\\":\\"port1\\" -> \\"id2\\":w;"');
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
                location,
              },
              port: {
                type: 'Literal',
                value: 'port1',
                quoted: true,
                location,
              },
              location,
            },
            {
              type: 'NodeRef',
              id: {
                type: 'Literal',
                value: 'id2',
                quoted: true,
                location,
              },
              compass: {
                type: 'Literal',
                value: 'w',
                quoted: false,
                location,
              },
              location,
            },
          ],
          body: [
            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
                location,
              },
              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
                location,
              },
              location,
            },
          ],
          location,
        }),
      ).toMatchInlineSnapshot(`
        "\\"id1\\":\\"port1\\" -> \\"id2\\":w [
          color = hoge;
        ];"
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
                location,
              },

              port: {
                type: 'Literal',
                value: 'port1',
                quoted: true,
                location,
              },

              location,
            },

            {
              type: 'NodeRef',
              id: {
                type: 'Literal',
                value: 'id2',
                quoted: true,
                location,
              },

              compass: {
                type: 'Literal',
                value: 'w',
                quoted: false,
                location,
              },

              location,
            },
          ],

          body: [
            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
                location,
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
                location,
              },

              location,
            },

            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
                location,
              },

              value: {
                type: 'Literal',
                value: 'fuga',
                quoted: false,
                location,
              },

              location,
            },
          ],

          location,
        }),
      ).toMatchInlineSnapshot(`
        "\\"id1\\":\\"port1\\" -> \\"id2\\":w [
          color = hoge;
          color = fuga;
        ];"
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
                location,
              },
              port: {
                type: 'Literal',
                value: 'port1',
                quoted: true,
                location,
              },
              location,
            },
            {
              type: 'NodeRefGroup',
              body: [
                {
                  type: 'NodeRef',
                  id: {
                    type: 'Literal',
                    value: 'id2',
                    quoted: true,
                    location,
                  },
                  location,
                },
                {
                  type: 'NodeRef',
                  id: {
                    type: 'Literal',
                    value: 'id3',
                    quoted: true,
                    location,
                  },
                  location,
                },
              ],
              location,
            },
          ],
          body: [],
          location,
        }),
      ).toMatchInlineSnapshot('"\\"id1\\":\\"port1\\" -> {\\"id2\\" \\"id3\\"};"');
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
            location,
          },
          body: [],
          location,
        }),
      ).toMatchInlineSnapshot('"subgraph \\"id1\\" {}"');
    });

    test('no id', () => {
      expect(
        stringify({
          type: 'Subgraph',
          body: [],
          location,
        }),
      ).toMatchInlineSnapshot('"subgraph {}"');
    });

    test('with body', () => {
      expect(
        stringify({
          type: 'Subgraph',
          body: [
            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
                location,
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
                location,
              },

              location,
            },
          ],

          location,
        }),
      ).toMatchInlineSnapshot(`
        "subgraph {
          color = hoge;
        }"
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
            location,
          },
          body: [],
          location,
        }),
      ).toMatchInlineSnapshot('"digraph \\"id1\\" {}"');
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
            location,
          },
          body: [],
          location,
        }),
      ).toMatchInlineSnapshot('"strict digraph \\"id1\\" {}"');
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
            location,
          },
          body: [],
          location,
        }),
      ).toMatchInlineSnapshot('"graph \\"id1\\" {}"');
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
            location,
          },
          body: [],
          location,
        }),
      ).toMatchInlineSnapshot('"strict graph \\"id1\\" {}"');
    });

    test('no id', () => {
      expect(
        stringify({
          type: 'Graph',
          strict: false,
          directed: true,
          body: [],
          location,
        }),
      ).toMatchInlineSnapshot('"digraph {}"');
    });

    test('with body', () => {
      expect(
        stringify({
          type: 'Graph',
          strict: false,
          directed: true,
          body: [
            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
                location,
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
                location,
              },

              location,
            },
          ],

          location,
        }),
      ).toMatchInlineSnapshot(`
        "digraph {
          color = hoge;
        }"
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
          location,
        }),
      ).toMatchInlineSnapshot(`
        "/**
         * test
         * test
         */"
      `);
    });

    test('macro', () => {
      expect(
        stringify({
          type: 'Comment',
          kind: 'Macro',
          value: 'foo\nbar',
          location,
        }),
      ).toMatchInlineSnapshot(`
        "# foo
        # bar"
      `);
    });

    test('slach', () => {
      expect(
        stringify({
          type: 'Comment',
          kind: 'Slash',
          value: 'foo\nbar',
          location,
        }),
      ).toMatchInlineSnapshot(`
        "// foo
        // bar"
      `);
    });
  });

  describe('dot', () => {
    test('slach', () => {
      expect(
        stringify({
          type: 'Dot',
          body: [
            {
              type: 'Comment',
              kind: 'Slash',
              value: 'foo\nbar',
              location,
            },
            {
              type: 'Graph',
              strict: false,
              directed: false,
              id: {
                type: 'Literal',
                value: 'id1',
                quoted: true,
                location,
              },
              body: [],
              location,
            },
          ],
          location,
        }),
      ).toMatchInlineSnapshot(`
        "// foo
        // bar
        graph \\"id1\\" {}"
      `);
    });
  });
});
