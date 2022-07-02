import { wrap } from 'jest-snapshot-serializer-raw';
import _ from 'ts-dedent';
import * as AST from '@ts-graphviz/dot-ast';
import { parse } from '../dot.peggy';
import { stringify } from '../stringify';

describe('parse', () => {
  describe('attribute', () => {
    test('set value', () => {
      const result = parse('style=filled;', { startRule: 'Attribute' });
      expect(result).toMatchSnapshot();
    });

    test('set quoted value', () => {
      const result = parse('label = "example #1";', { startRule: 'Attribute' });
      expect(result).toMatchSnapshot();
    });

    test('set HTMLLike value', () => {
      const result = parse(
        _`
        label = <
          <table border="0">
            <tr><td align="text">By default, td text is center-aligned</td></tr>
            <tr><td align="text">This td is left aligned<br align="left" /></td></tr>
            <tr><td align="text">this one centered<br align="center" /></td></tr>
            <tr><td align="text">and this one right aligned<br align="right" /><br align="right"/></td></tr>
            <tr><td align="text">The value of a closing<br align="left"/>&lt;br/&gt; tag<br align="center"/>refers to the preceeding text<br align="right"/></td></tr>
          </table>
        >`,
        { startRule: 'Attribute' },
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('attributes', () => {
    test('node', () => {
      const result = parse(
        _`
        node [
          style=filled;
          color=lightgrey;
          label = "example #1";
        ]
      `,
        { startRule: 'Attributes' },
      );
      expect(result).toMatchSnapshot();
    });

    test('edge', () => {
      const result = parse(
        _`
        edge [
          color=red;
          label = "example example";
        ];`,
        { startRule: 'Attributes' },
      );
      expect(result).toMatchSnapshot();
    });

    test('graph', () => {
      const result = parse('graph [ fillcolor=red, label = "example example"];', {
        startRule: 'Attributes',
      });
      expect(result).toMatchSnapshot();
    });

    test('with comment', () => {
      const result = parse(
        _`
        node [
           # comment 1
          style=filled,
        ]
      `,
        { startRule: 'Attributes' },
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('edge', () => {
    test('digraph edge', () => {
      const result = parse('a -> b;', { startRule: 'Edge' });
      expect(result).toMatchSnapshot();
    });

    test('graph edge', () => {
      const result = parse('a -- b;', { startRule: 'Edge' });
      expect(result).toMatchSnapshot();
    });

    test('edge with port', () => {
      const result = parse('a:p1 -> b:p2 -> c:p3:w -> d:w;', { startRule: 'Edge' });
      expect(result).toMatchSnapshot();
    });

    test('edge with attributes', () => {
      const result = parse(
        _`
          a -> b [
            color=lightgrey;
            label = "example #1";
          ];
        `,
        { startRule: 'Edge' },
      );
      expect(result).toMatchSnapshot();
    });

    test('grouped edge targets', () => {
      const result = parse('{a1, a2} -> {b1, b2};', { startRule: 'Edge' });
      expect(result).toMatchSnapshot();
    });

    test('grouped ported edge targets', () => {
      const result = parse('{a1:p1, a2:p2:w} -> {b1:e, b2:p3};', { startRule: 'Edge' });
      expect(result).toMatchSnapshot();
    });
  });

  describe('subgraph', () => {
    test('named subgraph', () => {
      const result = parse('subgraph hoge {}', { startRule: 'Subgraph' });
      expect(result).toMatchSnapshot();
    });

    test('anonymous subgraph', () => {
      const result = parse('subgraph {}', { startRule: 'Subgraph' });
      expect(result).toMatchSnapshot();
    });

    test('no keyword anonymous', () => {
      const result = parse('{}', { startRule: 'Subgraph' });
      expect(result).toMatchSnapshot();
    });
  });

  describe('graph', () => {
    test('digraph named test', () => {
      const result = parse('digraph test {}', { startRule: 'Graph' });
      expect(result).toMatchSnapshot();
    });

    test('strict digraph named test', () => {
      const result = parse('strict digraph test {}', { startRule: 'Graph' });
      expect(result).toMatchSnapshot();
    });

    test('digraph named test(quoted)', () => {
      const result = parse('digraph "test" {}', { startRule: 'Graph' });
      expect(result).toMatchSnapshot();
    });

    test('anonymous digraph', () => {
      const result = parse('digraph {}', { startRule: 'Graph' });
      expect(result).toMatchSnapshot();
    });

    test('graph named test', () => {
      const result = parse('graph test {}', { startRule: 'Graph' });
      expect(result).toMatchSnapshot();
    });

    test('strict graph named test', () => {
      const result = parse('strict graph test {}', { startRule: 'Graph' });
      expect(result).toMatchSnapshot();
    });

    describe('invalid edge', () => {
      test('digraph have to use "->" operator in edge', () => {
        expect(() => {
          parse(
            _`
            digraph {
              a -- b;
            }`,
            { startRule: 'Graph' },
          );
        }).toThrowErrorMatchingInlineSnapshot(
          `"In digraph, it's necessary to describe with \\"->\\" operator to create edge."`,
        );
      });

      test('graph have to use "--" operator in edge', () => {
        expect(() => {
          parse(
            _`
            graph {
              a -> b;
            }`,
            { startRule: 'Graph' },
          );
        }).toThrowErrorMatchingInlineSnapshot(
          `"In graph, it's necessary to describe with \\"--\\" operator to create edge."`,
        );
      });
    });
  });

  describe('node', () => {
    test('simple node', () => {
      const result = parse('test;', { startRule: 'Node' });
      expect(result).toMatchSnapshot();
    });

    test('node with attributes', () => {
      const result = parse(
        _`
          test [
            style=filled;
            color=lightgrey;
            label = "example #1";
          ];
        `,
        { startRule: 'Node' },
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('dot', () => {
    test('with comments', () => {
      const result = parse(
        _`
        /** comment1 */
        digraph {}
        /** comment2 */
        `,
        { startRule: 'Dot' },
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('cluster_statements', () => {
    test('comments', () => {
      const result = parse(
        _`
        // comment1

        // comment2
        // comment2

        # comment3

        # comment4
        # comment4
        /** comment 5*/
        `,
        { startRule: 'ClusterStatements' },
      );
      expect(result).toMatchSnapshot();
    });
  });
});

describe('stringify', () => {
  const location: AST.FileRange = {
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
        wrap(
          stringify({
            type: 'Literal',
            value: 'hoge',
            quoted: true,
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`"hoge"`);
    });

    test('not quated', () => {
      expect(
        wrap(
          stringify({
            type: 'Literal',
            value: 'hoge',
            quoted: false,
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`hoge`);
    });

    test('html label', () => {
      expect(
        wrap(
          stringify({
            type: 'Literal',
            value: 'hoge',
            quoted: 'html',
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`<hoge>`);
    });
  });

  describe('attribyte', () => {
    test('simple', () => {
      expect(
        wrap(
          stringify({
            type: 'Literal',
            value: 'hoge',
            quoted: 'html',
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`<hoge>`);
    });
  });

  describe('attribytes', () => {
    test('node', () => {
      expect(
        wrap(
          stringify({
            type: 'Attributes',
            kind: 'Node',
            body: [],
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`node;`);
    });

    test('edge', () => {
      expect(
        wrap(
          stringify({
            type: 'Attributes',
            kind: 'Edge',
            body: [],
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`edge;`);
    });

    test('graph', () => {
      expect(
        wrap(
          stringify({
            type: 'Attributes',
            kind: 'Graph',
            body: [],
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`graph;`);
    });

    test('with attribute', () => {
      expect(
        wrap(
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
        ),
      ).toMatchInlineSnapshot(`
        node [
          color = hoge;
        ];
      `);
    });
    test('with two attributes', () => {
      expect(
        wrap(
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
        ),
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
        wrap(
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
        ),
      ).toMatchInlineSnapshot(`color = hoge;`);
    });

    test('with attribute', () => {
      expect(
        wrap(
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
        ),
      ).toMatchInlineSnapshot(`
        "hoge" [
          color = hoge;
        ];
      `);
    });

    test('with two attributes', () => {
      expect(
        wrap(
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
        ),
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
        wrap(
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
        ),
      ).toMatchInlineSnapshot(`"id1":"port1" -> "id2":w;`);
    });

    test('with attribute', () => {
      expect(
        wrap(
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
        ),
      ).toMatchInlineSnapshot(`
        "id1":"port1" -> "id2":w [
          color = hoge;
        ];
      `);
    });

    test('with two attributes', () => {
      expect(
        wrap(
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
        ),
      ).toMatchInlineSnapshot(`
        "id1":"port1" -> "id2":w [
          color = hoge;
          color = fuga;
        ];
      `);
    });

    test('node ref group', () => {
      expect(
        wrap(
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
        ),
      ).toMatchInlineSnapshot(`"id1":"port1" -> {"id2" "id3"};`);
    });
  });

  describe('subgraph', () => {
    test('with id', () => {
      expect(
        wrap(
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
        ),
      ).toMatchInlineSnapshot(`subgraph "id1" {}`);
    });

    test('no id', () => {
      expect(
        wrap(
          stringify({
            type: 'Subgraph',
            body: [],
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`subgraph {}`);
    });

    test('with body', () => {
      expect(
        wrap(
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
        ),
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
        wrap(
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
        ),
      ).toMatchInlineSnapshot(`digraph "id1" {}`);
    });

    test('strict directed', () => {
      expect(
        wrap(
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
        ),
      ).toMatchInlineSnapshot(`strict digraph "id1" {}`);
    });

    test('graph', () => {
      expect(
        wrap(
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
        ),
      ).toMatchInlineSnapshot(`graph "id1" {}`);
    });

    test('strict graph', () => {
      expect(
        wrap(
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
        ),
      ).toMatchInlineSnapshot(`strict graph "id1" {}`);
    });

    test('no id', () => {
      expect(
        wrap(
          stringify({
            type: 'Graph',
            strict: false,
            directed: true,
            body: [],
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`digraph {}`);
    });

    test('with body', () => {
      expect(
        wrap(
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
        ),
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
        wrap(
          stringify({
            type: 'Comment',
            kind: 'Block',
            value: 'test\ntest',
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`
        /**
         * test
         * test
         */
      `);
    });

    test('macro', () => {
      expect(
        wrap(
          stringify({
            type: 'Comment',
            kind: 'Macro',
            value: 'foo\nbar',
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`
        # foo
        # bar
      `);
    });

    test('slach', () => {
      expect(
        wrap(
          stringify({
            type: 'Comment',
            kind: 'Slash',
            value: 'foo\nbar',
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`
        // foo
        // bar
      `);
    });
  });

  describe('dot', () => {
    test('slach', () => {
      expect(
        wrap(
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
        ),
      ).toMatchInlineSnapshot(`
        // foo
        // bar
        graph "id1" {}
      `);
    });
  });
});
