import { describe, expect, test } from 'vitest';
import { stringify } from '../printer/stringify.js';
import { parse, parseFragment } from './parse.js';

/** A `Literal` AST node, without its location. */
const literal = (value: string, kind: 'bare' | 'quoted' | 'html' = 'bare') => ({
  type: 'Literal',
  value,
  kind,
});

/** An `Attribute` AST node, without its location. */
const attribute = (
  key: string,
  value: string,
  kind: 'bare' | 'quoted' | 'html' = 'bare',
) => ({
  type: 'Attribute',
  key: literal(key),
  value: literal(value, kind),
});

describe('parse', () => {
  describe('attribute', () => {
    // The full shape of an attribute, locations included.
    test('set value', () => {
      const result = parseFragment('style=filled;', 'Attribute');
      expect(result).toMatchSnapshot();
    });

    test('set quoted value', () => {
      const result = parseFragment('label = "example #1";', 'Attribute');
      expect(result).toMatchObject(attribute('label', 'example #1', 'quoted'));
    });

    describe('quoted value with backslash-newline line continuation', () => {
      // Graphviz joins the lines and drops the continuation marker
      // https://graphviz.org/doc/info/lang.html#ids
      test('drops the marker before LF', () => {
        const result = parseFragment('label = "one\\\ntwo";', 'Attribute');
        expect(result.value.value).toBe('onetwo');
      });

      test('keeps surrounding whitespace', () => {
        const result = parseFragment('label = "one \\\n  two";', 'Attribute');
        expect(result.value.value).toBe('one   two');
      });

      test('keeps backslash + CR, like Graphviz (lib/cgraph/scan.l)', () => {
        const result = parseFragment('label = "one\\\rtwo";', 'Attribute');
        expect(result.value.value).toBe('one\\\rtwo');
      });

      test('keeps backslash + CRLF, like Graphviz', () => {
        const result = parseFragment('label = "one\\\r\ntwo";', 'Attribute');
        expect(result.value.value).toBe('one\\\r\ntwo');
      });

      test('keeps escape sequences as written (the model layer interprets them)', () => {
        const result = parseFragment(
          'label = "one\\ntwo \\"three\\"";',
          'Attribute',
        );
        expect(result.value.value).toBe('one\\ntwo \\"three\\"');
      });
    });

    describe('quoted value with raw newlines', () => {
      // Graphviz keeps unescaped newlines in quoted strings (`<qstring>[\n]`)
      test.each([
        ['LF', 'label = "one\ntwo";', 'one\ntwo'],
        ['CRLF', 'label = "one\r\ntwo";', 'one\r\ntwo'],
        ['CR', 'label = "one\rtwo";', 'one\rtwo'],
      ])('keeps a raw %s in the value', (_, dot, expected) => {
        const result = parseFragment(dot, 'Attribute');
        expect(result.value.value).toBe(expected);
      });

      test('stringify writes the quoted text back as it was', () => {
        const ast = parse('digraph { a [label="one\ntwo"]; }');
        expect(stringify(ast)).toMatchInlineSnapshot(`
          "digraph {
            a [
              label = "one
          two";
            ];
          }"
        `);
      });

      test('spans multiple lines in a node id', () => {
        const result = parseFragment('"no\nde";', 'Node');
        expect(result.id.value).toBe('no\nde');
      });
    });

    // The full shape of an HTML-like value: its text is kept as written.
    test('set HTMLLike value', () => {
      const result = parseFragment(
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
        'Attribute',
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('AttributeList', () => {
    test('node', () => {
      const result = parseFragment(
        `
        node [
          style=filled;
          color=lightgrey;
          label = "example #1";
        ]
      `,
        'AttributeList',
      );
      expect(result).toMatchObject({
        type: 'AttributeList',
        kind: 'Node',
        children: [
          attribute('style', 'filled'),
          attribute('color', 'lightgrey'),
          attribute('label', 'example #1', 'quoted'),
        ],
      });
      expect(result.children).toHaveLength(3);
    });

    test('edge', () => {
      const result = parseFragment(
        `
        edge [
          color=red;
          label = "example example";
        ];`,
        'AttributeList',
      );
      expect(result).toMatchObject({
        type: 'AttributeList',
        kind: 'Edge',
        children: [
          attribute('color', 'red'),
          attribute('label', 'example example', 'quoted'),
        ],
      });
      expect(result.children).toHaveLength(2);
    });

    test('graph', () => {
      const result = parseFragment(
        'graph [ fillcolor=red, label = "example example"];',
        'AttributeList',
      );
      expect(result).toMatchObject({
        type: 'AttributeList',
        kind: 'Graph',
        children: [
          attribute('fillcolor', 'red'),
          attribute('label', 'example example', 'quoted'),
        ],
      });
      expect(result.children).toHaveLength(2);
    });

    // The full shape of a comment inside an attribute list.
    test('with comment', () => {
      const result = parseFragment(
        `
        node [
           # comment 1
          style=filled,
        ]
      `,
        'AttributeList',
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('edge', () => {
    test('digraph edge', () => {
      const result = parseFragment('a -> b;', 'Edge');
      expect(result).toMatchObject({
        type: 'Edge',
        targets: [
          { type: 'NodeRef', id: literal('a') },
          { type: 'NodeRef', id: literal('b') },
        ],
        children: [],
      });
      expect(result.targets).toHaveLength(2);
    });

    test('graph edge', () => {
      const result = parseFragment('a -- b;', 'Edge');
      expect(result).toMatchObject({
        type: 'Edge',
        targets: [
          { type: 'NodeRef', id: literal('a') },
          { type: 'NodeRef', id: literal('b') },
        ],
        children: [],
      });
      expect(result.targets).toHaveLength(2);
    });

    // The full shape of node references with ports and compass points.
    test('edge with port', () => {
      const result = parseFragment('a:p1 -> b:p2 -> c:p3:w -> d:w;', 'Edge');
      expect(result).toMatchSnapshot();
    });

    test('edge with attributes', () => {
      const result = parseFragment(
        `
          a -> b [
            color=lightgrey;
            label = "example #1";
          ];
        `,
        'Edge',
      );
      expect(result).toMatchObject({
        type: 'Edge',
        targets: [
          { type: 'NodeRef', id: literal('a') },
          { type: 'NodeRef', id: literal('b') },
        ],
        children: [
          attribute('color', 'lightgrey'),
          attribute('label', 'example #1', 'quoted'),
        ],
      });
      expect(result.children).toHaveLength(2);
    });

    test('grouped edge targets', () => {
      const result = parseFragment('{a1, a2} -> {b1, b2};', 'Edge');
      const group = (...ids: string[]) => ({
        type: 'Subgraph',
        children: ids.map((id) => ({
          type: 'Node',
          id: literal(id),
          children: [],
        })),
      });
      expect(result).toMatchObject({
        type: 'Edge',
        targets: [group('a1', 'a2'), group('b1', 'b2')],
        children: [],
      });
      expect(result.targets).toHaveLength(2);
    });

    describe('non-ASCII bare ids', () => {
      // Graphviz treats every byte >= 0x80 as an id character and `dot
      // -Tcanon` prints such values bare.
      test.each(['￠', '😀', 'kéy', 'ñ1'])('%s parses bare', (id) => {
        const result = parseFragment(`${id} -- b;`, 'Edge');
        expect(result.targets[0]).toMatchObject({
          id: { value: id, kind: 'bare' },
        });
      });
    });

    describe('compass points', () => {
      const ref = (source: string) => {
        const [target] = parseFragment(`${source} -- b;`, 'Edge').targets;
        if (target.type !== 'NodeRef') {
          throw new TypeError(`expected a NodeRef, got ${target.type}`);
        }
        return target;
      };

      test.each(['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'c', '_'])(
        'a:p:%s is a port with a compass point',
        (compass) => {
          expect(ref(`a:p:${compass}`)).toMatchObject({
            id: { value: 'a' },
            port: { value: 'p' },
            compass: { value: compass },
          });
        },
      );

      test.each(['ne', 'sw', 'c', '"n"'])(
        'a:%s is a compass point, not a port',
        (compass) => {
          const node = ref(`a:${compass}`);
          expect(node.port).toBeUndefined();
          expect(node.compass?.value).toBe(compass.replaceAll('"', ''));
        },
      );

      test('a:north is a port', () => {
        expect(ref('a:north')).toMatchObject({ port: { value: 'north' } });
        expect(ref('a:north').compass).toBeUndefined();
      });

      test('a:p:nx keeps nx as an (unknown) compass point, not a new statement', () => {
        expect(ref('a:p:nx')).toMatchObject({
          port: { value: 'p' },
          compass: { value: 'nx' },
        });
      });

      test('an empty quoted compass point printed by dot -Tcanon parses (#1641)', () => {
        expect(ref('a:"":""')).toMatchObject({
          port: { value: '', kind: 'quoted' },
          compass: { value: '', kind: 'quoted' },
        });
      });
    });

    // The full shape: the ports of the nodes in a group are not kept.
    test('grouped ported edge targets', () => {
      const result = parseFragment(
        '{a1:p1, a2:p2:w} -> {b1:e, b2:p3};',
        'Edge',
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('subgraph', () => {
    test('named subgraph', () => {
      const result = parseFragment('subgraph hoge {}', 'Subgraph');
      expect(result).toMatchObject({
        type: 'Subgraph',
        id: literal('hoge'),
        children: [],
      });
    });

    test.each([
      ['anonymous subgraph', 'subgraph {}'],
      ['no keyword anonymous', '{}'],
    ])('%s', (_, dot) => {
      const result = parseFragment(dot, 'Subgraph');
      expect(result).toMatchObject({ type: 'Subgraph', children: [] });
      expect(result.id).toBeUndefined();
    });
  });

  describe('graph', () => {
    test.each([
      [
        'digraph test {}',
        { directed: true, strict: false, id: literal('test') },
      ],
      [
        'strict digraph test {}',
        { directed: true, strict: true, id: literal('test') },
      ],
      [
        'digraph "test" {}',
        { directed: true, strict: false, id: literal('test', 'quoted') },
      ],
      [
        'graph test {}',
        { directed: false, strict: false, id: literal('test') },
      ],
      [
        'strict graph test {}',
        { directed: false, strict: true, id: literal('test') },
      ],
    ])('%s', (dot, expected) => {
      const result = parseFragment(dot, 'Graph');
      expect(result).toMatchObject({
        type: 'Graph',
        children: [],
        ...expected,
      });
    });

    test('anonymous digraph', () => {
      const result = parseFragment('digraph {}', 'Graph');
      expect(result).toMatchObject({
        type: 'Graph',
        directed: true,
        strict: false,
        children: [],
      });
      expect(result.id).toBeUndefined();
    });

    describe('invalid edge', () => {
      /** The location of the first `op` in `source`. */
      const locationOf = (source: string, op: string) => {
        const offset = source.indexOf(op);
        const before = source.slice(0, offset);
        const line = before.split('\n').length;
        const column = offset - before.lastIndexOf('\n');
        return {
          start: { offset, line, column },
          end: { offset: offset + op.length, line, column: column + op.length },
        };
      };

      test.each([
        ['digraph has to use "->"', 'digraph {\n  a -- b;\n}', '--'],
        ['graph has to use "--"', 'graph {\n  a -> b;\n}', '->'],
      ])('%s, and the error points at the operator', (_, source, op) => {
        expect(() => parseFragment(source, 'Graph')).toThrow(
          expect.objectContaining({
            name: 'DotSyntaxError',
            code: 'TSG_ERR_DOT_SYNTAX',
            location: locationOf(source, op),
          }),
        );
      });
    });
  });

  describe('node', () => {
    test('simple node', () => {
      const result = parseFragment('test;', 'Node');
      expect(result).toMatchObject({
        type: 'Node',
        id: literal('test'),
        children: [],
      });
    });

    test('node with attributes', () => {
      const result = parseFragment(
        `
          test [
            style=filled;
            color=lightgrey;
            label = "example #1";
          ];
        `,
        'Node',
      );
      expect(result).toMatchObject({
        type: 'Node',
        id: literal('test'),
        children: [
          attribute('style', 'filled'),
          attribute('color', 'lightgrey'),
          attribute('label', 'example #1', 'quoted'),
        ],
      });
      expect(result.children).toHaveLength(3);
    });
  });

  describe('dot', () => {
    // The full shape of a DOT source: comments around a graph.
    test('with comments', () => {
      const result = parse(
        `
        /** comment1 */
        digraph {}
        /** comment2 */
        `,
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('cluster_statements', () => {
    // The full shape of each comment kind, and of how comments are merged.
    test('comments', () => {
      const result = parseFragment(
        `
        // comment1

        // comment2
        // comment2

        # comment3

        # comment4
        # comment4
        /** comment 5*/
        `,
        'ClusterStatements',
      );
      expect(result).toMatchSnapshot();
    });

    // issue #1625
    test('block comments keep asterisks inside their text', () => {
      const [comment] = parseFragment(
        `/**
          * a*b, 2 * 3
          * **bold**
          */`,
        'ClusterStatements',
      );
      expect(comment).toMatchObject({
        type: 'Comment',
        kind: 'Block',
        value: 'a*b, 2 * 3\n**bold**',
      });
    });
  });

  describe('line comments end only at "\\n" (found by fuzzing)', {
    tags: ['SM-1'],
  }, () => {
    // Graphviz reads `// c\rx -- y` as one comment: no edge.
    test.each([['// c\rx -- y'], ['# c\rx -- y']])(
      '%j is a single comment, as in Graphviz',
      (line) => {
        const ast = parse(`graph {\n  ${line}\n  a\n}`);
        const graph = ast.children[0] as { children: { type: string }[] };
        expect(graph.children.map((c) => c.type)).toStrictEqual([
          'Comment',
          'Node',
        ]);
      },
    );

    test('the "\\r" of a CRLF line ending is not part of the comment', () => {
      const ast = parse('// a\r\n// b\r\ngraph {}');
      expect(ast.children[0]).toMatchObject({ kind: 'Slash', value: 'a\nb' });
    });
  });

  describe('NUL characters (found by fuzzing)', { tags: ['SM-1'] }, () => {
    // Graphviz stops reading at a NUL, so a source with one cannot mean the
    // same thing to Graphviz and to this parser.
    test.each([['#\0'], ['graph{#\0\n7}'], ['graph { "a\0b" }'], ['/* \0 */']])(
      '%j is rejected with DotSyntaxError',
      (source) => {
        expect(() => parse(source)).toThrow(
          expect.objectContaining({
            name: 'DotSyntaxError',
            code: 'TSG_ERR_DOT_SYNTAX',
          }),
        );
      },
    );

    test('the error points at the NUL', () => {
      const source = 'graph {\n  a\0 }';
      const offset = source.indexOf('\0');
      expect(() => parse(source)).toThrow(
        expect.objectContaining({
          code: 'TSG_ERR_DOT_SYNTAX',
          location: {
            start: { offset, line: 2, column: 4 },
            end: { offset: offset + 1, line: 2, column: 5 },
          },
        }),
      );
    });
  });
});
