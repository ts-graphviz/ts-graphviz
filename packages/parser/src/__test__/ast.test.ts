import _ from 'ts-dedent';
import { AST } from '../ast';

describe('attribute', () => {
  test.each([
    [
      _`
        digraph {
          style=filled;
          color=lightgrey;
          label = "example #1";
        }
      `,
    ],
    [
      _`
        digraph {
          style=filled; color=lightgrey; label = "example #1";
        }
      `,
    ],
    [
      _`
        digraph {
          style=
          filled;
          color
          =lightgrey;
          label = "example #1";
        }
      `,
    ],
    [
      _`
        digraph {
          style=filled
          color=lightgrey
          label = "example #1"
        }
      `,
    ],
  ])('#', (dot) => {
    const result = AST.parse(dot);
    expect(result.body).toMatchObject([
      {
        type: AST.Types.Attribute,
        key: 'style',
        value: 'filled',
      },
      {
        type: AST.Types.Attribute,
        key: 'color',
        value: 'lightgrey',
      },
      {
        type: AST.Types.Attribute,
        key: 'label',
        value: 'example #1',
      },
    ]);
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
    expect(result).toMatchInlineSnapshot(`
      Object {
        "attributes": Array [
          Object {
            "key": "style",
            "value": "filled",
          },
          Object {
            "key": "color",
            "value": "lightgrey",
          },
          Object {
            "key": "label",
            "value": "example #1",
          },
        ],
        "target": "node",
        "type": "attributes",
      }
    `);
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
    expect(result).toMatchInlineSnapshot(`
      Object {
        "attributes": Array [
          Object {
            "key": "color",
            "value": "red",
          },
          Object {
            "key": "label",
            "value": "example example",
          },
        ],
        "target": "edge",
        "type": "attributes",
      }
    `);
  });

  test('graph', () => {
    const result = AST.parse('graph [ fillcolor=red, label = "example example"];', {
      rule: AST.Types.Attributes,
    });
    expect(result).toMatchInlineSnapshot(`
      Object {
        "attributes": Array [
          Object {
            "key": "fillcolor",
            "value": "red",
          },
          Object {
            "key": "label",
            "value": "example example",
          },
        ],
        "target": "graph",
        "type": "attributes",
      }
    `);
  });
});

describe('edge', () => {
  test('simple edge', () => {
    const result = AST.parse('a -> b;', { rule: AST.Types.Edge });
    expect(result).toMatchInlineSnapshot(`
      Object {
        "attributes": Array [],
        "targets": Array [
          Object {
            "id": "a",
            "type": "id",
          },
          Object {
            "id": "b",
            "type": "id",
          },
        ],
        "type": "edge",
      }
    `);
  });

  test('edge with port', () => {
    const result = AST.parse('a:p1 -> b:p2 -> c:p3:w -> d:w;', { rule: AST.Types.Edge });
    expect(result).toMatchInlineSnapshot(`
      Object {
        "attributes": Array [],
        "targets": Array [
          Object {
            "id": "a",
            "port": "p1",
            "type": "id",
          },
          Object {
            "id": "b",
            "port": "p2",
            "type": "id",
          },
          Object {
            "compass": "w",
            "id": "c",
            "port": "p3",
            "type": "id",
          },
          Object {
            "compass": "w",
            "id": "d",
            "type": "id",
          },
        ],
        "type": "edge",
      }
    `);
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
    expect(result).toMatchInlineSnapshot(`
      Object {
        "attributes": Array [
          Object {
            "key": "color",
            "value": "lightgrey",
          },
          Object {
            "key": "label",
            "value": "example #1",
          },
        ],
        "targets": Array [
          Object {
            "id": "a",
            "type": "id",
          },
          Object {
            "id": "b",
            "type": "id",
          },
        ],
        "type": "edge",
      }
    `);
  });

  test('grouped edge targets', () => {
    const result = AST.parse('{a1, a2} -> {b1, b2};', { rule: AST.Types.Edge });
    expect(result).toMatchInlineSnapshot(`
      Object {
        "attributes": Array [],
        "targets": Array [
          Array [
            Object {
              "id": "a1",
              "type": "id",
            },
            Object {
              "id": "a2",
              "type": "id",
            },
          ],
          Array [
            Object {
              "id": "b1",
              "type": "id",
            },
            Object {
              "id": "b2",
              "type": "id",
            },
          ],
        ],
        "type": "edge",
      }
    `);
  });

  test('grouped ported edge targets', () => {
    const result = AST.parse('{a1:p1, a2:p2:w} -> {b1:e, b2:p3};', { rule: AST.Types.Edge });
    expect(result).toMatchInlineSnapshot(`
      Object {
        "attributes": Array [],
        "targets": Array [
          Array [
            Object {
              "id": "a1",
              "port": "p1",
              "type": "id",
            },
            Object {
              "compass": "w",
              "id": "a2",
              "port": "p2",
              "type": "id",
            },
          ],
          Array [
            Object {
              "compass": "e",
              "id": "b1",
              "type": "id",
            },
            Object {
              "id": "b2",
              "port": "p3",
              "type": "id",
            },
          ],
        ],
        "type": "edge",
      }
    `);
  });
});
describe('graph', () => {
  test('digraph named test', () => {
    const result = AST.parse('digraph test {}');
    expect(result).toMatchInlineSnapshot(`
      Object {
        "body": Array [],
        "directed": true,
        "id": "test",
        "strict": false,
        "type": "graph",
      }
    `);
  });

  test('strict digraph named test', () => {
    const result = AST.parse('strict digraph test {}');
    expect(result).toMatchInlineSnapshot(`
      Object {
        "body": Array [],
        "directed": true,
        "id": "test",
        "strict": true,
        "type": "graph",
      }
    `);
  });

  test('digraph named test(quated)', () => {
    const result = AST.parse('digraph "test" {}');
    expect(result).toMatchInlineSnapshot(`
      Object {
        "body": Array [],
        "directed": true,
        "id": "test",
        "strict": false,
        "type": "graph",
      }
    `);
  });

  test('anonymous digraph', () => {
    const result = AST.parse('digraph {}');
    expect(result).toMatchInlineSnapshot(`
      Object {
        "body": Array [],
        "directed": true,
        "id": null,
        "strict": false,
        "type": "graph",
      }
    `);
  });

  test('graph named test', () => {
    const result = AST.parse('graph test {}');
    expect(result).toMatchInlineSnapshot(`
      Object {
        "body": Array [],
        "directed": false,
        "id": "test",
        "strict": false,
        "type": "graph",
      }
    `);
  });

  test('strict graph named test', () => {
    const result = AST.parse('strict graph test {}');
    expect(result).toMatchInlineSnapshot(`
      Object {
        "body": Array [],
        "directed": false,
        "id": "test",
        "strict": true,
        "type": "graph",
      }
    `);
  });
});

describe('node', () => {
  test('simple node', () => {
    const result = AST.parse('test;', { rule: AST.Types.Node });
    expect(result).toMatchInlineSnapshot(`
      Object {
        "attributes": Array [],
        "id": "test",
        "type": "node",
      }
    `);
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
    expect(result).toMatchInlineSnapshot(`
      Object {
        "attributes": Array [
          Object {
            "key": "style",
            "value": "filled",
          },
          Object {
            "key": "color",
            "value": "lightgrey",
          },
          Object {
            "key": "label",
            "value": "example #1",
          },
        ],
        "id": "test",
        "type": "node",
      }
    `);
  });
});
