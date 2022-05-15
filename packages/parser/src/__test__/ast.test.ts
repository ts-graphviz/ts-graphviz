import { wrap } from 'jest-snapshot-serializer-raw';
import _ from 'ts-dedent';
import { AST } from '../ast';

describe('parse', () => {
  describe('attribute', () => {
    test('set value', () => {
      const result = AST.parse('style=filled;', { rule: AST.Types.Attribute });
      expect(result).toMatchSnapshot();
    });

    test('set quoted value', () => {
      const result = AST.parse('label = "example #1";', { rule: AST.Types.Attribute });
      expect(result).toMatchSnapshot();
    });

    test('set HTMLLike value', () => {
      const result = AST.parse(
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
        { rule: AST.Types.Attribute },
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('attributes', () => {
    test('node', () => {
      const result = AST.parse(
        _`
        node [
          style=filled;
          color=lightgrey;
          label = "example #1";
        ]
      `,
        { rule: AST.Types.Attributes },
      );
      expect(result).toMatchSnapshot();
    });

    test('edge', () => {
      const result = AST.parse(
        _`
        edge [
          color=red;
          label = "example example";
        ];`,
        { rule: AST.Types.Attributes },
      );
      expect(result).toMatchSnapshot();
    });

    test('graph', () => {
      const result = AST.parse('graph [ fillcolor=red, label = "example example"];', {
        rule: AST.Types.Attributes,
      });
      expect(result).toMatchSnapshot();
    });

    test('with comment', () => {
      const result = AST.parse(
        _`
        node [
           # comment 1
          style=filled,
        ]
      `,
        { rule: AST.Types.Attributes },
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('edge', () => {
    test('digraph edge', () => {
      const result = AST.parse('a -> b;', { rule: AST.Types.Edge });
      expect(result).toMatchSnapshot();
    });

    test('graph edge', () => {
      const result = AST.parse('a -- b;', { rule: AST.Types.Edge });
      expect(result).toMatchSnapshot();
    });

    test('edge with port', () => {
      const result = AST.parse('a:p1 -> b:p2 -> c:p3:w -> d:w;', { rule: AST.Types.Edge });
      expect(result).toMatchSnapshot();
    });

    test('edge with attributes', () => {
      const result = AST.parse(
        _`
          a -> b [
            color=lightgrey;
            label = "example #1";
          ];
        `,
        { rule: AST.Types.Edge },
      );
      expect(result).toMatchSnapshot();
    });

    test('grouped edge targets', () => {
      const result = AST.parse('{a1, a2} -> {b1, b2};', { rule: AST.Types.Edge });
      expect(result).toMatchSnapshot();
    });

    test('grouped ported edge targets', () => {
      const result = AST.parse('{a1:p1, a2:p2:w} -> {b1:e, b2:p3};', { rule: AST.Types.Edge });
      expect(result).toMatchSnapshot();
    });
  });

  describe('subgraph', () => {
    test('named subgraph', () => {
      const result = AST.parse('subgraph hoge {}', { rule: AST.Types.Subgraph });
      expect(result).toMatchSnapshot();
    });

    test('anonymous subgraph', () => {
      const result = AST.parse('subgraph {}', { rule: AST.Types.Subgraph });
      expect(result).toMatchSnapshot();
    });

    test('no keyword anonymous', () => {
      const result = AST.parse('{}', { rule: AST.Types.Subgraph });
      expect(result).toMatchSnapshot();
    });
  });

  describe('graph', () => {
    test('digraph named test', () => {
      const result = AST.parse('digraph test {}', { rule: AST.Types.Graph });
      expect(result).toMatchSnapshot();
    });

    test('strict digraph named test', () => {
      const result = AST.parse('strict digraph test {}', { rule: AST.Types.Graph });
      expect(result).toMatchSnapshot();
    });

    test('digraph named test(quoted)', () => {
      const result = AST.parse('digraph "test" {}', { rule: AST.Types.Graph });
      expect(result).toMatchSnapshot();
    });

    test('anonymous digraph', () => {
      const result = AST.parse('digraph {}', { rule: AST.Types.Graph });
      expect(result).toMatchSnapshot();
    });

    test('graph named test', () => {
      const result = AST.parse('graph test {}', { rule: AST.Types.Graph });
      expect(result).toMatchSnapshot();
    });

    test('strict graph named test', () => {
      const result = AST.parse('strict graph test {}', { rule: AST.Types.Graph });
      expect(result).toMatchSnapshot();
    });

    describe('invalid edge', () => {
      test('digraph have to use "->" operator in edge', () => {
        expect(() => {
          AST.parse(
            _`
            digraph {
              a -- b;
            }`,
            { rule: AST.Types.Graph },
          );
        }).toThrowErrorMatchingInlineSnapshot(
          `"In digraph, it's necessary to describe with \\"->\\" operator to create edge."`,
        );
      });

      test('graph have to use "--" operator in edge', () => {
        expect(() => {
          AST.parse(
            _`
            graph {
              a -> b;
            }`,
            { rule: AST.Types.Graph },
          );
        }).toThrowErrorMatchingInlineSnapshot(
          `"In graph, it's necessary to describe with \\"--\\" operator to create edge."`,
        );
      });
    });
  });

  describe('node', () => {
    test('simple node', () => {
      const result = AST.parse('test;', { rule: AST.Types.Node });
      expect(result).toMatchSnapshot();
    });

    test('node with attributes', () => {
      const result = AST.parse(
        _`
          test [
            style=filled;
            color=lightgrey;
            label = "example #1";
          ];
        `,
        { rule: AST.Types.Node },
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('dot', () => {
    test('with comments', () => {
      const result = AST.parse(
        _`
        /** comment1 */
        digraph {}
        /** comment2 */
        `,
        { rule: AST.Types.Dot },
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('cluster_statements', () => {
    test('comments', () => {
      const result = AST.parse(
        _`
        // comment1

        // comment2
        // comment2

        # comment3

        # comment4
        # comment4
        /** comment 5*/
        `,
        { rule: AST.Types.ClusterStatements },
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
          AST.stringify({
            type: AST.Types.Literal,
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
          AST.stringify({
            type: AST.Types.Literal,
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
          AST.stringify({
            type: AST.Types.Literal,
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
          AST.stringify({
            type: AST.Types.Literal,
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
          AST.stringify({
            type: AST.Types.Attributes,
            kind: AST.Attributes.Kind.Node,
            body: [],
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`node;`);
    });

    test('edge', () => {
      expect(
        wrap(
          AST.stringify({
            type: AST.Types.Attributes,
            kind: AST.Attributes.Kind.Edge,
            body: [],
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`edge;`);
    });

    test('graph', () => {
      expect(
        wrap(
          AST.stringify({
            type: AST.Types.Attributes,
            kind: AST.Attributes.Kind.Graph,
            body: [],
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`graph;`);
    });

    test('with attribute', () => {
      expect(
        wrap(
          AST.stringify({
            type: AST.Types.Attributes,
            kind: AST.Attributes.Kind.Node,
            body: [
              {
                type: AST.Types.Attribute,
                key: {
                  type: AST.Types.Literal,
                  value: 'hoge',
                  quoted: false,
                  location,
                },
                value: {
                  type: AST.Types.Literal,
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
          hoge = hoge;
        ];
      `);
    });
    test('with two attributes', () => {
      expect(
        wrap(
          AST.stringify({
            type: AST.Types.Attributes,
            kind: AST.Attributes.Kind.Node,
            body: [
              {
                type: AST.Types.Attribute,
                key: {
                  type: AST.Types.Literal,
                  value: 'hoge',
                  quoted: false,
                  location,
                },
                value: {
                  type: AST.Types.Literal,
                  value: 'hoge',
                  quoted: false,
                  location,
                },
                location,
              },
              {
                type: AST.Types.Attribute,
                key: {
                  type: AST.Types.Literal,
                  value: 'fuga',
                  quoted: false,
                  location,
                },
                value: {
                  type: AST.Types.Literal,
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
          hoge = hoge;
          fuga = fuga;
        ];
      `);
    });
  });

  describe('node', () => {
    test('simple', () => {
      expect(
        wrap(
          AST.stringify({
            type: AST.Types.Attribute,
            key: {
              type: AST.Types.Literal,
              value: 'hoge',
              quoted: false,
              location,
            },
            value: {
              type: AST.Types.Literal,
              value: 'hoge',
              quoted: false,
              location,
            },
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`hoge = hoge;`);
    });

    test('with attribute', () => {
      expect(
        wrap(
          AST.stringify({
            type: AST.Types.Node,
            body: [
              {
                type: AST.Types.Attribute,
                key: {
                  type: AST.Types.Literal,
                  value: 'hoge',
                  quoted: false,
                  location,
                },
                value: {
                  type: AST.Types.Literal,
                  value: 'hoge',
                  quoted: false,
                  location,
                },
                location,
              },
            ],
            id: {
              type: AST.Types.Literal,
              value: 'hoge',
              quoted: true,
              location,
            },
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`
        "hoge" [
          hoge = hoge;
        ];
      `);
    });

    test('with two attributes', () => {
      expect(
        wrap(
          AST.stringify({
            type: AST.Types.Node,
            body: [
              {
                type: AST.Types.Attribute,
                key: {
                  type: AST.Types.Literal,
                  value: 'hoge',
                  quoted: false,
                  location,
                },
                value: {
                  type: AST.Types.Literal,
                  value: 'hoge',
                  quoted: false,
                  location,
                },
                location,
              },
              {
                type: AST.Types.Attribute,
                key: {
                  type: AST.Types.Literal,
                  value: 'fuga',
                  quoted: false,
                  location,
                },
                value: {
                  type: AST.Types.Literal,
                  value: 'fuga',
                  quoted: false,
                  location,
                },
                location,
              },
            ],
            id: {
              type: AST.Types.Literal,
              value: 'hoge',
              quoted: true,
              location,
            },
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`
        "hoge" [
          hoge = hoge;
          fuga = fuga;
        ];
      `);
    });
  });

  describe('edge', () => {
    test('simple', () => {
      expect(
        wrap(
          AST.stringify({
            type: AST.Types.Edge,
            targets: [
              {
                type: AST.Types.NodeRef,
                id: {
                  type: AST.Types.Literal,
                  value: 'id1',
                  quoted: true,
                  location,
                },
                port: {
                  type: AST.Types.Literal,
                  value: 'port1',
                  quoted: true,
                  location,
                },
                location,
              },
              {
                type: AST.Types.NodeRef,
                id: {
                  type: AST.Types.Literal,
                  value: 'id2',
                  quoted: true,
                  location,
                },
                compass: {
                  type: AST.Types.Literal,
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
          AST.stringify({
            type: AST.Types.Edge,
            targets: [
              {
                type: AST.Types.NodeRef,
                id: {
                  type: AST.Types.Literal,
                  value: 'id1',
                  quoted: true,
                  location,
                },
                port: {
                  type: AST.Types.Literal,
                  value: 'port1',
                  quoted: true,
                  location,
                },
                location,
              },
              {
                type: AST.Types.NodeRef,
                id: {
                  type: AST.Types.Literal,
                  value: 'id2',
                  quoted: true,
                  location,
                },
                compass: {
                  type: AST.Types.Literal,
                  value: 'w',
                  quoted: false,
                  location,
                },
                location,
              },
            ],
            body: [
              {
                type: AST.Types.Attribute,
                key: {
                  type: AST.Types.Literal,
                  value: 'hoge',
                  quoted: false,
                  location,
                },
                value: {
                  type: AST.Types.Literal,
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
          hoge = hoge;
        ];
      `);
    });

    test('with two attributes', () => {
      expect(
        wrap(
          AST.stringify({
            type: AST.Types.Edge,
            targets: [
              {
                type: AST.Types.NodeRef,
                id: {
                  type: AST.Types.Literal,
                  value: 'id1',
                  quoted: true,
                  location,
                },
                port: {
                  type: AST.Types.Literal,
                  value: 'port1',
                  quoted: true,
                  location,
                },
                location,
              },
              {
                type: AST.Types.NodeRef,
                id: {
                  type: AST.Types.Literal,
                  value: 'id2',
                  quoted: true,
                  location,
                },
                compass: {
                  type: AST.Types.Literal,
                  value: 'w',
                  quoted: false,
                  location,
                },
                location,
              },
            ],
            body: [
              {
                type: AST.Types.Attribute,
                key: {
                  type: AST.Types.Literal,
                  value: 'hoge',
                  quoted: false,
                  location,
                },
                value: {
                  type: AST.Types.Literal,
                  value: 'hoge',
                  quoted: false,
                  location,
                },
                location,
              },
              {
                type: AST.Types.Attribute,
                key: {
                  type: AST.Types.Literal,
                  value: 'fuga',
                  quoted: false,
                  location,
                },
                value: {
                  type: AST.Types.Literal,
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
          hoge = hoge;
          fuga = fuga;
        ];
      `);
    });

    test('node ref group', () => {
      expect(
        wrap(
          AST.stringify({
            type: AST.Types.Edge,
            targets: [
              {
                type: AST.Types.NodeRef,
                id: {
                  type: AST.Types.Literal,
                  value: 'id1',
                  quoted: true,
                  location,
                },
                port: {
                  type: AST.Types.Literal,
                  value: 'port1',
                  quoted: true,
                  location,
                },
                location,
              },
              {
                type: AST.Types.NodeRefGroup,
                body: [
                  {
                    type: AST.Types.NodeRef,
                    id: {
                      type: AST.Types.Literal,
                      value: 'id2',
                      quoted: true,
                      location,
                    },
                    location,
                  },
                  {
                    type: AST.Types.NodeRef,
                    id: {
                      type: AST.Types.Literal,
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
          AST.stringify({
            type: AST.Types.Subgraph,
            id: {
              type: AST.Types.Literal,
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
          AST.stringify({
            type: AST.Types.Subgraph,
            body: [],
            location,
          }),
        ),
      ).toMatchInlineSnapshot(`subgraph {}`);
    });

    test('with body', () => {
      expect(
        wrap(
          AST.stringify({
            type: AST.Types.Subgraph,
            body: [
              {
                type: AST.Types.Attribute,
                key: {
                  type: AST.Types.Literal,
                  value: 'hoge',
                  quoted: false,
                  location,
                },
                value: {
                  type: AST.Types.Literal,
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
          hoge = hoge;
        }
      `);
    });
  });

  describe('graph', () => {
    test('directed', () => {
      expect(
        wrap(
          AST.stringify({
            type: AST.Types.Graph,
            strict: false,
            directed: true,
            id: {
              type: AST.Types.Literal,
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
          AST.stringify({
            type: AST.Types.Graph,
            strict: true,
            directed: true,
            id: {
              type: AST.Types.Literal,
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
          AST.stringify({
            type: AST.Types.Graph,
            strict: false,
            directed: false,
            id: {
              type: AST.Types.Literal,
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
          AST.stringify({
            type: AST.Types.Graph,
            strict: true,
            directed: false,
            id: {
              type: AST.Types.Literal,
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
          AST.stringify({
            type: AST.Types.Graph,
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
          AST.stringify({
            type: AST.Types.Graph,
            strict: false,
            directed: true,
            body: [
              {
                type: AST.Types.Attribute,
                key: {
                  type: AST.Types.Literal,
                  value: 'hoge',
                  quoted: false,
                  location,
                },
                value: {
                  type: AST.Types.Literal,
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
          hoge = hoge;
        }
      `);
    });
  });

  describe('comment', () => {
    test('block', () => {
      expect(
        wrap(
          AST.stringify({
            type: AST.Types.Comment,
            kind: AST.Comment.Kind.Block,
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
          AST.stringify({
            type: AST.Types.Comment,
            kind: AST.Comment.Kind.Macro,
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
          AST.stringify({
            type: AST.Types.Comment,
            kind: AST.Comment.Kind.Slash,
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
          AST.stringify({
            type: AST.Types.Dot,
            body: [
              {
                type: AST.Types.Comment,
                kind: AST.Comment.Kind.Slash,
                value: 'foo\nbar',
                location,
              },
              {
                type: AST.Types.Graph,
                strict: false,
                directed: false,
                id: {
                  type: AST.Types.Literal,
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
