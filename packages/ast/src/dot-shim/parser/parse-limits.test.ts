import { describe, expect, test } from 'vitest';
import { parse, parseFragment } from './parse.js';

// The parser limits of SM-1 (input size, HTML-like nesting, edge-chain
// depth, AST node count) and that each of them is per parse. The nesting of
// graph and subgraph bodies (`maxNestingDepth`) is tested in nesting.test.ts.

/** A DotSyntaxError, the error a parse stopped by a limit throws. */
const dotSyntaxError = (fields: Record<string, unknown> = {}) =>
  expect.objectContaining({
    name: 'DotSyntaxError',
    code: 'TSG_ERR_DOT_SYNTAX',
    ...fields,
  });

/** A position on the first line of a source. */
const at = (offset: number) => ({ offset, line: 1, column: offset + 1 });

/** An attribute whose HTML-like value has `levels` levels inside its `<…>`. */
const htmlAttribute = (levels: number) =>
  `label = <${'<'.repeat(levels)}content${'>'.repeat(levels)}>`;

/**
 * Where an HTML-like nesting error points: at the `<` that goes one level
 * past `limit` (the outer `<` of the value is level 1).
 */
const htmlNestingLocation = (limit: number) => {
  const offset = 'label = <'.length + limit;
  return { start: at(offset), end: at(offset) };
};

/** A chain of `edges` edges: `n0 -> n1 -> …`. */
const edgeChain = (edges: number, prefix = 'n') =>
  Array.from({ length: edges + 1 }, (_, i) => `${prefix}${i}`).join(' -> ');

/** `digraph { n0; n1; … }` with `count` node statements. */
const nodeStatements = (count: number) =>
  `digraph { ${Array.from({ length: count }, (_, i) => `n${i};`).join('\n')} }`;

/** The smallest `maxASTNodes` with which `source` parses as a graph. */
const nodeCountOf = (source: string) => {
  for (let limit = 1; ; limit++) {
    try {
      parseFragment(source, 'Graph', { maxASTNodes: limit });
      return limit;
    } catch {}
  }
};

describe('parser limits', { tags: ['SM-1'] }, () => {
  describe('input size (maxInputSize)', () => {
    /** A graph of exactly `bytes` bytes. */
    const graphOfSize = (bytes: number) => {
      const wrapper = 'graph { label=""; }';
      return `graph { label="${'x'.repeat(bytes - wrapper.length)}"; }`;
    };

    test('a source of exactly the default limit (10 MiB) parses', () => {
      expect(
        parseFragment(graphOfSize(10 * 1024 * 1024), 'Graph'),
      ).toMatchObject({ type: 'Graph' });
    });

    test('a source over the default limit is rejected, with no location', () => {
      expect(() =>
        parseFragment(graphOfSize(10 * 1024 * 1024 + 1), 'Graph'),
      ).toThrow(dotSyntaxError({ location: undefined }));
    });

    test('a custom limit is inclusive', () => {
      const limit = 1024 * 1024;
      expect(
        parseFragment(graphOfSize(limit), 'Graph', { maxInputSize: limit }),
      ).toMatchObject({ type: 'Graph' });
      expect(() =>
        parseFragment(graphOfSize(limit + 1), 'Graph', { maxInputSize: limit }),
      ).toThrow(dotSyntaxError({ location: undefined }));
    });

    test('the size is counted in UTF-8 bytes, not in characters', () => {
      // 600 characters, 1200 bytes
      const source = `graph { label="${'é'.repeat(600)}"; }`;
      expect(source.length).toBeLessThan(1024);
      expect(() => parse(source, { maxInputSize: 1024 })).toThrow(
        dotSyntaxError({ location: undefined }),
      );
    });

    test('the limit applies to parse as well as parseFragment', () => {
      expect(() => parse(graphOfSize(2048), { maxInputSize: 1024 })).toThrow(
        dotSyntaxError({ location: undefined }),
      );
    });

    test('maxInputSize: 0 disables the limit', () => {
      const source = graphOfSize(15 * 1024 * 1024);
      expect(parseFragment(source, 'Graph', { maxInputSize: 0 })).toMatchObject(
        { type: 'Graph' },
      );
    });
  });

  describe('HTML-like nesting depth (maxHtmlNestingDepth)', () => {
    test('normal and mixed nesting parse', () => {
      expect(
        parseFragment(
          'label = <<table><tr><td><b>text</b></td></tr></table>>',
          'Attribute',
        ),
      ).toMatchObject({ value: { kind: 'html' } });
      expect(
        parseFragment('label = <<<<aaa<<<<bbbb>>>>ccc>>>>', 'Attribute'),
      ).toMatchObject({ value: { kind: 'html' } });
    });

    test.each([
      [undefined, 100],
      [50, 50],
      [200, 200],
    ])(
      'with maxHtmlNestingDepth %s, %i levels in all parse and one more is rejected',
      (option, limit) => {
        const options =
          option === undefined ? {} : { maxHtmlNestingDepth: option };
        // the outer `<…>` of the value is one of the levels
        expect(
          parseFragment(htmlAttribute(limit - 1), 'Attribute', options),
        ).toMatchObject({ value: { kind: 'html' } });
        expect(() =>
          parseFragment(htmlAttribute(limit), 'Attribute', options),
        ).toThrow(dotSyntaxError({ location: htmlNestingLocation(limit) }));
      },
    );

    test('a value far deeper than the limit is rejected at the limit', () => {
      expect(() => parseFragment(htmlAttribute(200), 'Attribute')).toThrow(
        dotSyntaxError({ location: htmlNestingLocation(100) }),
      );
    });
  });

  describe('edge chain depth (maxEdgeChainDepth)', () => {
    /**
     * Where the error for a chain of `edges` edges over `limit` points: at
     * its last `limit + 1` edges (the chain is read from its end), from the
     * end of the target before them to the end of the chain. `start` is the
     * offset of the chain in the source.
     */
    const chainLocation = (edges: number, limit: number, start = 0) => ({
      start: at(start + edgeChain(edges - limit - 1).length),
      end: at(start + edgeChain(edges).length),
    });

    test('a short chain parses', () => {
      expect(parseFragment('a -> b -> c -> d;', 'Edge').targets).toHaveLength(
        4,
      );
    });

    test.each([
      [undefined, 1000],
      [100, 100],
    ])(
      'with maxEdgeChainDepth %s, %i edges parse and one more is rejected',
      (option, limit) => {
        const options =
          option === undefined ? {} : { maxEdgeChainDepth: option };
        expect(
          parseFragment(`${edgeChain(limit)};`, 'Edge', options).targets,
        ).toHaveLength(limit + 1);
        expect(() =>
          parseFragment(`${edgeChain(limit + 1)};`, 'Edge', options),
        ).toThrow(
          dotSyntaxError({ location: chainLocation(limit + 1, limit) }),
        );
      },
    );

    test('a chain far longer than the limit is rejected', () => {
      expect(() => parseFragment(`${edgeChain(2000)};`, 'Edge')).toThrow(
        dotSyntaxError({ location: chainLocation(2000, 1000) }),
      );
    });

    test('the limit applies to a chain inside a graph', () => {
      const prefix = 'digraph { ';
      expect(() => parse(`${prefix}${edgeChain(1001)}; }`)).toThrow(
        dotSyntaxError({ location: chainLocation(1001, 1000, prefix.length) }),
      );
    });

    test('separate chains do not add up', () => {
      const source = `digraph { ${edgeChain(999, 'a')}; ${edgeChain(999, 'b')}; }`;
      expect(parseFragment(source, 'Graph').children).toHaveLength(2);
    });
  });

  describe('AST node count (maxASTNodes)', () => {
    /** What a parse stopped by the node count throws. */
    const nodeCountError = (maxNodes: number) =>
      dotSyntaxError({
        location: undefined,
        cause: expect.objectContaining({
          code: 'TSG_ERR_AST_NODE_COUNT_EXCEEDED',
          maxNodes,
        }),
      });

    test('a custom limit is inclusive', () => {
      const source = 'digraph { a; b; c; d; e; f; g; h; i; j; }';
      const count = nodeCountOf(source);
      expect(
        parseFragment(source, 'Graph', { maxASTNodes: count }),
      ).toMatchObject({ type: 'Graph' });
      expect(() =>
        parseFragment(source, 'Graph', { maxASTNodes: count - 1 }),
      ).toThrow(nodeCountError(count - 1));
    });

    test('a small limit stops a larger source', () => {
      expect(() =>
        parseFragment('digraph { a; b; c; d; e; f; g; h; i; j; }', 'Graph', {
          maxASTNodes: 5,
        }),
      ).toThrow(nodeCountError(5));
    });

    test('15000 node statements parse with the default limit', () => {
      expect(
        parseFragment(nodeStatements(15000), 'Graph').children,
      ).toHaveLength(15000);
    });

    test('75000 node statements exceed the default limit (100000)', () => {
      expect(() => parseFragment(nodeStatements(75000), 'Graph')).toThrow(
        nodeCountError(100000),
      );
    });

    test('a custom limit counts every node of the source', () => {
      expect(
        parseFragment(nodeStatements(5000), 'Graph', { maxASTNodes: 30000 })
          .children,
      ).toHaveLength(5000);
      expect(() =>
        parseFragment(nodeStatements(7000), 'Graph', { maxASTNodes: 10000 }),
      ).toThrow(nodeCountError(10000));
    });

    test('edges count their targets', () => {
      const edges = Array.from(
        { length: 25000 },
        (_, i) => `n${i} -> n${i + 1};`,
      ).join('\n');
      expect(() =>
        parseFragment(`digraph { ${edges} }`, 'Graph', { maxASTNodes: 100000 }),
      ).toThrow(nodeCountError(100000));
    });

    test('the limit applies to parse as well as parseFragment', () => {
      expect(() =>
        parse('digraph { a; b; c; d; e; f; g; h; i; j; }', { maxASTNodes: 5 }),
      ).toThrow(nodeCountError(5));
    });

    test('maxASTNodes: 0 disables the limit', () => {
      expect(
        parseFragment(nodeStatements(150000), 'Graph', { maxASTNodes: 0 })
          .children,
      ).toHaveLength(150000);
    });
  });

  describe('each limit is per parse', () => {
    test('the node count starts again at each parse', () => {
      const source = 'digraph { a; b; c; d; e; }';
      const count = nodeCountOf(source);
      for (let i = 0; i < 5; i++) {
        expect(
          parseFragment(source, 'Graph', { maxASTNodes: count }),
        ).toMatchObject({ type: 'Graph' });
      }
    });

    test('a parse stopped by the node count does not count toward the next', () => {
      const source = 'digraph { a; b; c; d; e; }';
      const count = nodeCountOf(source);
      expect(() =>
        parseFragment(nodeStatements(100), 'Graph', { maxASTNodes: count }),
      ).toThrow(dotSyntaxError());
      expect(
        parseFragment(source, 'Graph', { maxASTNodes: count }),
      ).toMatchObject({ type: 'Graph' });
    });

    test('the HTML-like nesting depth starts again at each parse', () => {
      const options = { maxHtmlNestingDepth: 50 };
      expect(() =>
        parseFragment(htmlAttribute(60), 'Attribute', options),
      ).toThrow(dotSyntaxError());
      for (let i = 0; i < 2; i++) {
        expect(
          parseFragment(htmlAttribute(49), 'Attribute', options),
        ).toMatchObject({ value: { kind: 'html' } });
      }
    });

    test('the edge chain depth starts again at each parse', () => {
      const options = { maxEdgeChainDepth: 100 };
      expect(() =>
        parseFragment(`${edgeChain(150)};`, 'Edge', options),
      ).toThrow(dotSyntaxError());
      for (let i = 0; i < 2; i++) {
        expect(
          parseFragment(`${edgeChain(100)};`, 'Edge', options).targets,
        ).toHaveLength(101);
      }
    });

    test('a syntax error does not affect the next parse', () => {
      expect(() => parseFragment('invalid syntax here!', 'Graph')).toThrow(
        dotSyntaxError({
          location: { start: at(0), end: at(1) },
        }),
      );
      expect(parseFragment('digraph { a -> b; }', 'Graph')).toMatchObject({
        type: 'Graph',
      });
    });
  });
});
