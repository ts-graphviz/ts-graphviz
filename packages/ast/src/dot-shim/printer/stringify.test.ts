import { describe, expect, test } from 'vitest';
import { parse } from '../parser/parse.js';
import { stringify } from './stringify.js';

describe('stringify', () => {
  describe('literal', () => {
    test('quated', () => {
      expect(
        stringify({
          type: 'Literal',
          value: 'hoge',
          quoted: true,
        }),
      ).toMatchInlineSnapshot(`""hoge""`);
    });

    test('not quated', () => {
      expect(
        stringify({
          type: 'Literal',
          value: 'hoge',
          quoted: false,
        }),
      ).toMatchInlineSnapshot(`"hoge"`);
    });

    test('html label', () => {
      expect(
        stringify({
          type: 'Literal',
          value: 'hoge',
          quoted: 'html',
        }),
      ).toMatchInlineSnapshot(`"<hoge>"`);
    });
  });

  describe('separate line comments (found by fuzzing)', () => {
    test.each([
      ['#\n\n#'],
      ['#a\n\n#b'],
      ['//a\n\n//b'],
      ['graph {\n  //a\n\n  //b\n}'],
      ['graph { a [\n //x\n\n //y\n c=d] }'],
    ])('%j stays two comments through stringify', (source) => {
      const ast = parse(source);
      const printed = stringify(ast);
      const strip = (v: unknown) =>
        JSON.stringify(v, (k, x) => (k === 'location' ? undefined : x));
      expect(strip(parse(printed))).toBe(strip(ast));
      expect(printed).not.toMatch(/[ \t]+\n/);
    });
  });

  describe('raw newlines inside literals', () => {
    test('are written verbatim, without the indentation', () => {
      const source = 'graph {\n  a:"\n" -- "x\ny" [label = <a\nb>];\n}';
      const printed = stringify(parse(source));
      expect(printed).toContain('  a:"\n" -- "x\ny" [');
      expect(printed).toContain('label = <a\nb>');
      expect(stringify(parse(printed))).toBe(printed);
    });
  });

  describe('attribyte', () => {
    test('simple', () => {
      expect(
        stringify({
          type: 'Literal',
          value: 'hoge',
          quoted: 'html',
        }),
      ).toMatchInlineSnapshot(`"<hoge>"`);
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
      ).toMatchInlineSnapshot(`"node [];"`);
    });

    test('edge', () => {
      expect(
        stringify({
          type: 'AttributeList',
          kind: 'Edge',
          children: [],
        }),
      ).toMatchInlineSnapshot(`"edge [];"`);
    });

    test('graph', () => {
      expect(
        stringify({
          type: 'AttributeList',
          kind: 'Graph',
          children: [],
        }),
      ).toMatchInlineSnapshot(`"graph [];"`);
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
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
              },
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        "node [
          color = hoge;
        ];"
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
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
              },
            },

            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'bgcolor',
                quoted: false,
              },

              value: {
                type: 'Literal',
                value: 'fuga',
                quoted: false,
              },
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        "node [
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
          },

          value: {
            type: 'Literal',
            value: 'hoge',
            quoted: false,
          },
        }),
      ).toMatchInlineSnapshot(`"color = hoge;"`);
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
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
              },
            },
          ],

          id: {
            type: 'Literal',
            value: 'hoge',
            quoted: true,
          },
        }),
      ).toMatchInlineSnapshot(`
        ""hoge" [
          color = hoge;
        ];"
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
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
              },
            },

            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'bgcolor',
                quoted: false,
              },

              value: {
                type: 'Literal',
                value: 'fuga',
                quoted: false,
              },
            },
          ],

          id: {
            type: 'Literal',
            value: 'hoge',
            quoted: true,
          },
        }),
      ).toMatchInlineSnapshot(`
        ""hoge" [
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
              },

              port: {
                type: 'Literal',
                value: 'port1',
                quoted: true,
              },
            },

            {
              type: 'NodeRef',
              id: {
                type: 'Literal',
                value: 'id2',
                quoted: true,
              },

              compass: {
                type: 'Literal',
                value: 'w',
                quoted: false,
              },
            },
          ],

          children: [],
        }),
      ).toMatchInlineSnapshot(`""id1":"port1" -> "id2":w;"`);
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
              },

              port: {
                type: 'Literal',
                value: 'port1',
                quoted: true,
              },
            },

            {
              type: 'NodeRef',
              id: {
                type: 'Literal',
                value: 'id2',
                quoted: true,
              },

              compass: {
                type: 'Literal',
                value: 'w',
                quoted: false,
              },
            },
          ],

          children: [
            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
              },
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        ""id1":"port1" -> "id2":w [
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
              },

              port: {
                type: 'Literal',
                value: 'port1',
                quoted: true,
              },
            },

            {
              type: 'NodeRef',
              id: {
                type: 'Literal',
                value: 'id2',
                quoted: true,
              },

              compass: {
                type: 'Literal',
                value: 'w',
                quoted: false,
              },
            },
          ],

          children: [
            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
              },
            },

            {
              type: 'Attribute',
              key: {
                type: 'Literal',
                value: 'color',
                quoted: false,
              },

              value: {
                type: 'Literal',
                value: 'fuga',
                quoted: false,
              },
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        ""id1":"port1" -> "id2":w [
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
              },

              port: {
                type: 'Literal',
                value: 'port1',
                quoted: true,
              },
            },

            {
              type: 'NodeRefGroup',
              refs: [
                {
                  type: 'NodeRef',
                  id: {
                    type: 'Literal',
                    value: 'id2',
                    quoted: true,
                  },
                },

                {
                  type: 'NodeRef',
                  id: {
                    type: 'Literal',
                    value: 'id3',
                    quoted: true,
                  },
                },
              ],
            },
          ],

          children: [],
        }),
      ).toMatchInlineSnapshot(`""id1":"port1" -> {"id2" "id3"};"`);
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
          },
          children: [],
        }),
      ).toMatchInlineSnapshot(`"subgraph "id1" {}"`);
    });

    test('no id', () => {
      expect(
        stringify({
          type: 'Subgraph',
          children: [],
        }),
      ).toMatchInlineSnapshot(`"subgraph {}"`);
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
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
              },
            },
          ],
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
          },
          children: [],
        }),
      ).toMatchInlineSnapshot(`"digraph "id1" {}"`);
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
          },

          children: [],
        }),
      ).toMatchInlineSnapshot(`"strict digraph "id1" {}"`);
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
          },

          children: [],
        }),
      ).toMatchInlineSnapshot(`"graph "id1" {}"`);
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
          },

          children: [],
        }),
      ).toMatchInlineSnapshot(`"strict graph "id1" {}"`);
    });

    test('no id', () => {
      expect(
        stringify({
          type: 'Graph',
          strict: false,
          directed: true,
          children: [],
        }),
      ).toMatchInlineSnapshot(`"digraph {}"`);
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
              },

              value: {
                type: 'Literal',
                value: 'hoge',
                quoted: false,
              },
            },
          ],
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
        }),
      ).toMatchInlineSnapshot(`
        "// foo
        // bar"
      `);
    });

    test('block comment with */ injection attempt', () => {
      expect(
        stringify({
          type: 'Comment',
          kind: 'Block',
          value: 'malicious */ digraph { a -> b; } /*',
        }),
      ).toMatchInlineSnapshot(`
        "/**
         * malicious *​/ digraph { a -> b; } /*
         */"
      `);
    });

    test('a comment with a null byte is rejected, not altered', () => {
      expect(() =>
        stringify({
          type: 'Comment',
          kind: 'Block',
          value: 'test\0null\0byte',
        }),
      ).toThrow(expect.objectContaining({ code: 'TSG_ERR_NUL_CHARACTER' }));
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
            },

            {
              type: 'Graph',
              strict: false,
              directed: false,
              id: {
                type: 'Literal',
                value: 'id1',
                quoted: true,
              },

              children: [],
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        "// foo
        // bar
        graph "id1" {}"
      `);
    });
  });
});
