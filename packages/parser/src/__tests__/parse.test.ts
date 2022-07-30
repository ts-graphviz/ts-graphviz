import { describe, expect, test } from 'vitest';
import { default as _ } from 'ts-dedent';
import { parse } from '../parse.js';

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
