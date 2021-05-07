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
    expect(result.children).toMatchObject([
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
    const dot = _`
      digraph {
        node [
          style=filled;
          color=lightgrey;
          label = "example #1";
        ]
      }
    `;
    const result = AST.parse(dot);
    expect(result.children).toMatchObject([
      {
        type: AST.Types.Attributes,
        target: AST.Attributes.Target.Node,
        attributes: [
          {
            key: 'style',
            value: 'filled',
          },
          {
            key: 'color',
            value: 'lightgrey',
          },
          {
            key: 'label',
            value: 'example #1',
          },
        ],
      },
    ]);
  });

  test('edge', () => {
    const dot = _`
      digraph {
        edge [
          color=red;
          label = "example example";
        ];
      }
    `;
    const result = AST.parse(dot);
    expect(result.children).toMatchObject([
      {
        type: AST.Types.Attributes,
        target: AST.Attributes.Target.Edge,
        attributes: [
          {
            key: 'color',
            value: 'red',
          },
          {
            key: 'label',
            value: 'example example',
          },
        ],
      },
    ]);
  });

  test('graph', () => {
    const dot = _`
      digraph {
        graph [ fillcolor=red, label = "example example"]
      }
    `;
    const result = AST.parse(dot);
    expect(result.children).toMatchObject([
      {
        type: AST.Types.Attributes,
        target: AST.Attributes.Target.Graph,
        attributes: [
          {
            key: 'fillcolor',
            value: 'red',
          },
          {
            key: 'label',
            value: 'example example',
          },
        ],
      },
    ]);
  });
});

describe('edge', () => {
  test('simple edge', () => {
    const result = AST.parse(`
      digraph {
        a -> b;
      }
    `);
    expect(result.children[0]).toMatchObject({
      type: AST.Types.Edge,
      targets: [{ id: 'a' }, { id: 'b' }],
      attributes: [],
    });
  });

  test('edge with port', () => {
    const result = AST.parse(_`
      digraph {
        a:p1 -> b:p2 -> c:p3:w -> d:w;
      }
    `);
    expect(result.children[0]).toMatchObject({
      type: AST.Types.Edge,
      targets: [
        { id: 'a', port: 'p1' },
        { id: 'b', port: 'p2' },
        { id: 'c', port: 'p3', compass: 'w' },
        { id: 'd', compass: 'w' },
      ],
      attributes: [],
    });
  });

  test('edge with attributes', () => {
    const result = AST.parse(`
      digraph {
        a -> b [
          color=lightgrey;
          label = "example #1";
        ];
      }
    `);
    expect(result.children[0]).toMatchObject({
      type: AST.Types.Edge,
      targets: [{ id: 'a' }, { id: 'b' }],
      attributes: [
        {
          key: 'color',
          value: 'lightgrey',
        },
        {
          key: 'label',
          value: 'example #1',
        },
      ],
    });
  });

  test('grouped edge targets', () => {
    const result = AST.parse(`
      digraph {
        {a1, a2} -> {b1, b2};
      }
    `);
    expect(result.children[0]).toMatchObject({
      type: AST.Types.Edge,
      targets: [
        [{ id: 'a1' }, { id: 'a2' }],
        [{ id: 'b1' }, { id: 'b2' }],
      ],
      attributes: [],
    });
  });

  test('grouped ported edge targets', () => {
    const result = AST.parse(_`
      digraph {
        {a1:p1, a2:p2:w} -> {b1:e, b2:p3};
      }
    `);
    expect(result.children[0]).toMatchObject({
      type: AST.Types.Edge,
      targets: [
        [
          { id: 'a1', port: 'p1' },
          { id: 'a2', port: 'p2', compass: 'w' },
        ],
        [
          { id: 'b1', compass: 'e' },
          { id: 'b2', port: 'p3' },
        ],
      ],
      attributes: [],
    });
  });
});
describe('graph', () => {
  test('digraph named test', () => {
    const result = AST.parse('digraph test {}');
    expect(result).toMatchObject({
      type: AST.Types.Graph,
      id: 'test',
      directed: true,
      strict: false,
      children: [],
    });
  });

  test('strict digraph named test', () => {
    const result = AST.parse('strict digraph test {}');
    expect(result).toMatchObject({
      type: AST.Types.Graph,
      id: 'test',
      directed: true,
      strict: true,
      children: [],
    });
  });

  test('digraph named test(quated)', () => {
    const result = AST.parse('digraph "test" {}');
    expect(result).toMatchObject({
      type: AST.Types.Graph,
      id: 'test',
      directed: true,
      strict: false,
      children: [],
    });
  });

  test('anonymous digraph', () => {
    const result = AST.parse('digraph {}');
    expect(result).toMatchObject({
      type: AST.Types.Graph,
      strict: false,
      directed: true,
      children: [],
    });
  });

  test('graph named test', () => {
    const result = AST.parse('graph test {}');
    expect(result).toMatchObject({
      type: AST.Types.Graph,
      id: 'test',
      directed: false,
      strict: false,
      children: [],
    });
  });

  test('strict graph named test', () => {
    const result = AST.parse('strict graph test {}');
    expect(result).toMatchObject({
      type: AST.Types.Graph,
      id: 'test',
      directed: false,
      strict: true,
      children: [],
    });
  });
});

describe('node', () => {
  test('simple node', () => {
    const result = AST.parse(_`
      digraph {
        test;
      }
    `);
    expect(result.children[0]).toMatchObject({
      type: AST.Types.Node,
      id: 'test',
      attributes: [],
    });
  });

  test('node with attributes', () => {
    const result = AST.parse(_`
      digraph {
        test [
          style=filled;
          color=lightgrey;
          label = "example #1";
        ];
      }
    `);
    expect(result.children[0]).toMatchObject({
      type: AST.Types.Node,
      id: 'test',
      attributes: [
        {
          key: 'style',
          value: 'filled',
        },
        {
          key: 'color',
          value: 'lightgrey',
        },
        {
          key: 'label',
          value: 'example #1',
        },
      ],
    });
  });
});
