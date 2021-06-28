import _ from 'ts-dedent';
import { AST } from '../ast';

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
