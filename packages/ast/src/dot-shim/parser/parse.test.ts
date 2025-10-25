import { describe, expect, test } from 'vitest';
import { parse } from './parse.js';

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
        `
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

  describe('AttributeList', () => {
    test('node', () => {
      const result = parse(
        `
        node [
          style=filled;
          color=lightgrey;
          label = "example #1";
        ]
      `,
        { startRule: 'AttributeList' },
      );
      expect(result).toMatchSnapshot();
    });

    test('edge', () => {
      const result = parse(
        `
        edge [
          color=red;
          label = "example example";
        ];`,
        { startRule: 'AttributeList' },
      );
      expect(result).toMatchSnapshot();
    });

    test('graph', () => {
      const result = parse(
        'graph [ fillcolor=red, label = "example example"];',
        {
          startRule: 'AttributeList',
        },
      );
      expect(result).toMatchSnapshot();
    });

    test('with comment', () => {
      const result = parse(
        `
        node [
           # comment 1
          style=filled,
        ]
      `,
        { startRule: 'AttributeList' },
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
      const result = parse('a:p1 -> b:p2 -> c:p3:w -> d:w;', {
        startRule: 'Edge',
      });
      expect(result).toMatchSnapshot();
    });

    test('edge with attributes', () => {
      const result = parse(
        `
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
      const result = parse('{a1:p1, a2:p2:w} -> {b1:e, b2:p3};', {
        startRule: 'Edge',
      });
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
            `
            digraph {
              a -- b;
            }`,
            { startRule: 'Graph' },
          );
        }).toThrowErrorMatchingInlineSnapshot(
          `[DotSyntaxError: In digraph, it's necessary to describe with "->" operator to create edge.]`,
        );
      });

      test('graph have to use "--" operator in edge', () => {
        expect(() => {
          parse(
            `
            graph {
              a -> b;
            }`,
            { startRule: 'Graph' },
          );
        }).toThrowErrorMatchingInlineSnapshot(
          `[DotSyntaxError: In graph, it's necessary to describe with "--" operator to create edge.]`,
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
        `
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
        `
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
        `
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

  describe('HTML string nesting depth limit', () => {
    test('normal nesting should work', () => {
      const result = parse(
        'label = <<table><tr><td><b>text</b></td></tr></table>>',
        { startRule: 'Attribute' },
      );
      expect(result).toBeDefined();
    });

    test('moderate nesting (50 levels) should work', () => {
      const nested = `${'<'.repeat(50)}content${'>'.repeat(50)}`;
      const result = parse(`label = <${nested}>`, { startRule: 'Attribute' });
      expect(result).toBeDefined();
    });

    test('maximum allowed nesting (99 levels inside outer tag) should work', () => {
      // The outer < > from the HTML string itself counts as level 1,
      // so 99 additional levels inside = 100 total depth
      const nested = `${'<'.repeat(99)}content${'>'.repeat(99)}`;
      const result = parse(`label = <${nested}>`, { startRule: 'Attribute' });
      expect(result).toBeDefined();
    });

    test('excessive nesting (100 levels inside outer tag) should throw error', () => {
      // 100 levels inside + 1 outer = 101 total depth, which exceeds the limit
      const nested = `${'<'.repeat(100)}content${'>'.repeat(100)}`;
      expect(() => {
        parse(`label = <${nested}>`, { startRule: 'Attribute' });
      }).toThrowError(
        /HTML nesting depth exceeds maximum allowed depth of 100/,
      );
    });

    test('deeply nested structure (200 levels) should throw error', () => {
      const nested = `${'<'.repeat(200)}content${'>'.repeat(200)}`;
      expect(() => {
        parse(`label = <${nested}>`, { startRule: 'Attribute' });
      }).toThrowError(
        /HTML nesting depth exceeds maximum allowed depth of 100/,
      );
    });

    test('mixed content with deep nesting should handle correctly', () => {
      const nested = '<<<aaa<<<<bbbb>>>>ccc>>>';
      const result = parse(`label = <${nested}>`, { startRule: 'Attribute' });
      expect(result).toBeDefined();
    });

    test('custom maxHtmlNestingDepth (50) should allow 49 levels', () => {
      const nested = `${'<'.repeat(49)}content${'>'.repeat(49)}`;
      const result = parse(`label = <${nested}>`, {
        startRule: 'Attribute',
        maxHtmlNestingDepth: 50,
      });
      expect(result).toBeDefined();
    });

    test('custom maxHtmlNestingDepth (50) should reject 50 levels', () => {
      const nested = `${'<'.repeat(50)}content${'>'.repeat(50)}`;
      expect(() => {
        parse(`label = <${nested}>`, {
          startRule: 'Attribute',
          maxHtmlNestingDepth: 50,
        });
      }).toThrowError(/HTML nesting depth exceeds maximum allowed depth of 50/);
    });

    test('custom maxHtmlNestingDepth (200) should allow 199 levels', () => {
      const nested = `${'<'.repeat(199)}content${'>'.repeat(199)}`;
      const result = parse(`label = <${nested}>`, {
        startRule: 'Attribute',
        maxHtmlNestingDepth: 200,
      });
      expect(result).toBeDefined();
    });

    test('custom maxHtmlNestingDepth (200) should reject 200 levels', () => {
      const nested = `${'<'.repeat(200)}content${'>'.repeat(200)}`;
      expect(() => {
        parse(`label = <${nested}>`, {
          startRule: 'Attribute',
          maxHtmlNestingDepth: 200,
        });
      }).toThrowError(
        /HTML nesting depth exceeds maximum allowed depth of 200/,
      );
    });
  });

  describe('Edge chain depth limit', () => {
    test('normal edge chain should work', () => {
      const result = parse('a -> b -> c -> d;', { startRule: 'Edge' });
      expect(result).toBeDefined();
      expect(result.targets).toHaveLength(4);
    });

    test('moderate edge chain (100 nodes) should work', () => {
      const nodes = Array.from({ length: 100 }, (_, i) => `n${i}`);
      const chain = nodes.join(' -> ');
      const result = parse(`${chain};`, { startRule: 'Edge' });
      expect(result).toBeDefined();
      expect(result.targets).toHaveLength(100);
    });

    test('maximum allowed edge chain (1000 edges) should work', () => {
      // 1000 edges = 1001 nodes (first node + 1000 additional nodes connected by 1000 edges)
      const nodes = Array.from({ length: 1001 }, (_, i) => `n${i}`);
      const chain = nodes.join(' -> ');
      const result = parse(`${chain};`, { startRule: 'Edge' });
      expect(result).toBeDefined();
      expect(result.targets).toHaveLength(1001);
    });

    test('excessive edge chain (1001 edges) should throw error', () => {
      // 1001 edges = 1002 nodes, which exceeds the limit
      const nodes = Array.from({ length: 1002 }, (_, i) => `n${i}`);
      const chain = nodes.join(' -> ');
      expect(() => {
        parse(`${chain};`, { startRule: 'Edge' });
      }).toThrowError(/Edge chain depth exceeds maximum allowed depth of 1000/);
    });

    test('deeply chained edge structure (2000 edges) should throw error', () => {
      const nodes = Array.from({ length: 2001 }, (_, i) => `n${i}`);
      const chain = nodes.join(' -> ');
      expect(() => {
        parse(`${chain};`, { startRule: 'Edge' });
      }).toThrowError(/Edge chain depth exceeds maximum allowed depth of 1000/);
    });

    test('custom maxEdgeChainDepth (100) should allow 100 edges', () => {
      const nodes = Array.from({ length: 101 }, (_, i) => `n${i}`);
      const chain = nodes.join(' -> ');
      const result = parse(`${chain};`, {
        startRule: 'Edge',
        maxEdgeChainDepth: 100,
      });
      expect(result).toBeDefined();
      expect(result.targets).toHaveLength(101);
    });

    test('custom maxEdgeChainDepth (100) should reject 101 edges', () => {
      const nodes = Array.from({ length: 102 }, (_, i) => `n${i}`);
      const chain = nodes.join(' -> ');
      expect(() => {
        parse(`${chain};`, {
          startRule: 'Edge',
          maxEdgeChainDepth: 100,
        });
      }).toThrowError(/Edge chain depth exceeds maximum allowed depth of 100/);
    });

    test('edge chain in full graph context should respect limit', () => {
      const nodes = Array.from({ length: 1002 }, (_, i) => `n${i}`);
      const chain = nodes.join(' -> ');
      expect(() => {
        parse(`digraph { ${chain}; }`, { startRule: 'Graph' });
      }).toThrowError(/Edge chain depth exceeds maximum allowed depth of 1000/);
    });

    test('multiple separate edge chains should not accumulate depth', () => {
      const nodes1 = Array.from({ length: 500 }, (_, i) => `a${i}`);
      const nodes2 = Array.from({ length: 500 }, (_, i) => `b${i}`);
      const chain1 = nodes1.join(' -> ');
      const chain2 = nodes2.join(' -> ');
      const result = parse(`digraph { ${chain1}; ${chain2}; }`, {
        startRule: 'Graph',
      });
      expect(result).toBeDefined();
    });
  });
});
