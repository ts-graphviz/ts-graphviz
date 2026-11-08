import { describe, expect, test } from 'vitest';
import { parse } from './parse.js';

// The parser limits of SM-1 (input size, HTML-like nesting, edge-chain
// depth, AST node count) and that each of them is per parse. The nesting of
// graph and subgraph bodies (`maxNestingDepth`) is tested in nesting.test.ts.

/**
 * A DotSyntaxError, the error a parse stopped by a limit throws; its
 * `limit` names the option.
 */
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

/**
 * The AST nodes the parser counts for `nodeStatements(count)`: the graph,
 * and for each statement the node, its id and the node reference it is read
 * as first.
 */
const nodeCountOf = (count: number) => 1 + 3 * count;

describe('parser limits', { tags: ['SM-1'] }, () => {
  describe('input size (maxInputSize)', () => {
    /** A graph of exactly `bytes` bytes. */
    const graphOfSize = (bytes: number) => {
      const wrapper = 'graph { label=""; }';
      return `graph { label="${'x'.repeat(bytes - wrapper.length)}"; }`;
    };

    test('a source of exactly the default limit (10 MiB) parses', () => {
      expect(
        parse(graphOfSize(10 * 1024 * 1024), { startRule: 'Graph' }),
      ).toMatchObject({ type: 'Graph' });
    });

    test('a source over the default limit is rejected, with no location', () => {
      expect(() =>
        parse(graphOfSize(10 * 1024 * 1024 + 1), { startRule: 'Graph' }),
      ).toThrow(dotSyntaxError({ location: undefined, limit: 'maxInputSize' }));
    });

    test('a custom limit is inclusive', () => {
      const limit = 1024 * 1024;
      expect(
        parse(graphOfSize(limit), { startRule: 'Graph', maxInputSize: limit }),
      ).toMatchObject({ type: 'Graph' });
      expect(() =>
        parse(graphOfSize(limit + 1), {
          startRule: 'Graph',
          maxInputSize: limit,
        }),
      ).toThrow(dotSyntaxError({ location: undefined, limit: 'maxInputSize' }));
    });

    test('the size is counted in UTF-8 bytes, not in characters', () => {
      // 600 characters, 1200 bytes
      const source = `graph { label="${'é'.repeat(600)}"; }`;
      expect(source.length).toBeLessThan(1024);
      expect(() => parse(source, { maxInputSize: 1024 })).toThrow(
        dotSyntaxError({ location: undefined, limit: 'maxInputSize' }),
      );
    });

    test('the limit applies to a whole DOT source', () => {
      expect(() => parse(graphOfSize(2048), { maxInputSize: 1024 })).toThrow(
        dotSyntaxError({ location: undefined, limit: 'maxInputSize' }),
      );
    });

    test('maxInputSize: 0 disables the limit', () => {
      const source = graphOfSize(15 * 1024 * 1024);
      expect(
        parse(source, { startRule: 'Graph', maxInputSize: 0 }),
      ).toMatchObject({ type: 'Graph' });
    });
  });

  describe('HTML-like nesting depth (maxHtmlNestingDepth)', () => {
    test('normal and mixed nesting parse', () => {
      expect(
        parse('label = <<table><tr><td><b>text</b></td></tr></table>>', {
          startRule: 'Attribute',
        }),
      ).toMatchObject({ value: { kind: 'html' } });
      expect(
        parse('label = <<<<aaa<<<<bbbb>>>>ccc>>>>', { startRule: 'Attribute' }),
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
          parse(htmlAttribute(limit - 1), {
            ...options,
            startRule: 'Attribute',
          }),
        ).toMatchObject({ value: { kind: 'html' } });
        expect(() =>
          parse(htmlAttribute(limit), { ...options, startRule: 'Attribute' }),
        ).toThrow(
          dotSyntaxError({
            limit: 'maxHtmlNestingDepth',
            location: htmlNestingLocation(limit),
          }),
        );
      },
    );

    test('a value far deeper than the limit is rejected at the limit', () => {
      expect(() =>
        parse(htmlAttribute(200), { startRule: 'Attribute' }),
      ).toThrow(
        dotSyntaxError({
          limit: 'maxHtmlNestingDepth',
          location: htmlNestingLocation(100),
        }),
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
      expect(
        parse('a -> b -> c -> d;', { startRule: 'Edge' }).targets,
      ).toHaveLength(4);
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
          parse(`${edgeChain(limit)};`, { ...options, startRule: 'Edge' })
            .targets,
        ).toHaveLength(limit + 1);
        expect(() =>
          parse(`${edgeChain(limit + 1)};`, { ...options, startRule: 'Edge' }),
        ).toThrow(
          dotSyntaxError({
            limit: 'maxEdgeChainDepth',
            location: chainLocation(limit + 1, limit),
          }),
        );
      },
    );

    test('a chain far longer than the limit is rejected', () => {
      expect(() => parse(`${edgeChain(2000)};`, { startRule: 'Edge' })).toThrow(
        dotSyntaxError({
          limit: 'maxEdgeChainDepth',
          location: chainLocation(2000, 1000),
        }),
      );
    });

    test('the limit applies to a chain inside a graph', () => {
      const prefix = 'digraph { ';
      expect(() => parse(`${prefix}${edgeChain(1001)}; }`)).toThrow(
        dotSyntaxError({
          limit: 'maxEdgeChainDepth',
          location: chainLocation(1001, 1000, prefix.length),
        }),
      );
    });

    test('separate chains do not add up', () => {
      const source = `digraph { ${edgeChain(999, 'a')}; ${edgeChain(999, 'b')}; }`;
      expect(parse(source, { startRule: 'Graph' }).children).toHaveLength(2);
    });
  });

  describe('AST node count (maxASTNodes)', () => {
    /** What a parse stopped by the node count throws. */
    const nodeCountError = (maxNodes: number) =>
      dotSyntaxError({
        location: undefined,
        limit: 'maxASTNodes',
        // Not the contract (`cause` may change), but which limit was hit.
        cause: expect.objectContaining({
          code: 'TSG_ERR_AST_NODE_COUNT_EXCEEDED',
          maxNodes,
        }),
      });

    test('a custom limit is inclusive', () => {
      const source = nodeStatements(10);
      const count = nodeCountOf(10);
      expect(
        parse(source, { startRule: 'Graph', maxASTNodes: count }),
      ).toMatchObject({ type: 'Graph' });
      expect(() =>
        parse(source, { startRule: 'Graph', maxASTNodes: count - 1 }),
      ).toThrow(nodeCountError(count - 1));
    });

    test('a small limit stops a larger source', () => {
      expect(() =>
        parse('digraph { a; b; c; d; e; f; g; h; i; j; }', {
          startRule: 'Graph',
          maxASTNodes: 5,
        }),
      ).toThrow(nodeCountError(5));
    });

    test('15000 node statements parse with the default limit', () => {
      expect(
        parse(nodeStatements(15000), { startRule: 'Graph' }).children,
      ).toHaveLength(15000);
    });

    test('75000 node statements exceed the default limit (100000)', () => {
      expect(() =>
        parse(nodeStatements(75000), { startRule: 'Graph' }),
      ).toThrow(nodeCountError(100000));
    });

    test('a custom limit counts every node of the source', () => {
      expect(
        parse(nodeStatements(5000), { startRule: 'Graph', maxASTNodes: 30000 })
          .children,
      ).toHaveLength(5000);
      expect(() =>
        parse(nodeStatements(7000), { startRule: 'Graph', maxASTNodes: 10000 }),
      ).toThrow(nodeCountError(10000));
    });

    test('edges count their targets', () => {
      const edges = Array.from(
        { length: 25000 },
        (_, i) => `n${i} -> n${i + 1};`,
      ).join('\n');
      expect(() =>
        parse(`digraph { ${edges} }`, {
          startRule: 'Graph',
          maxASTNodes: 100000,
        }),
      ).toThrow(nodeCountError(100000));
    });

    test('the limit applies to a whole DOT source', () => {
      expect(() =>
        parse('digraph { a; b; c; d; e; f; g; h; i; j; }', { maxASTNodes: 5 }),
      ).toThrow(nodeCountError(5));
    });

    test('maxASTNodes: 0 disables the limit', () => {
      expect(
        parse(nodeStatements(150000), { startRule: 'Graph', maxASTNodes: 0 })
          .children,
      ).toHaveLength(150000);
    });
  });

  describe('each limit is per parse', () => {
    test('the node count starts again at each parse', () => {
      const source = nodeStatements(5);
      const count = nodeCountOf(5);
      for (let i = 0; i < 5; i++) {
        expect(
          parse(source, { startRule: 'Graph', maxASTNodes: count }),
        ).toMatchObject({ type: 'Graph' });
      }
    });

    test('a parse stopped by the node count does not count toward the next', () => {
      const source = nodeStatements(5);
      const count = nodeCountOf(5);
      expect(() =>
        parse(nodeStatements(100), { startRule: 'Graph', maxASTNodes: count }),
      ).toThrow(dotSyntaxError({ limit: 'maxASTNodes' }));
      expect(
        parse(source, { startRule: 'Graph', maxASTNodes: count }),
      ).toMatchObject({ type: 'Graph' });
    });

    test('the HTML-like nesting depth starts again at each parse', () => {
      const options = { maxHtmlNestingDepth: 50 };
      expect(() =>
        parse(htmlAttribute(60), { ...options, startRule: 'Attribute' }),
      ).toThrow(dotSyntaxError({ limit: 'maxHtmlNestingDepth' }));
      for (let i = 0; i < 2; i++) {
        expect(
          parse(htmlAttribute(49), { ...options, startRule: 'Attribute' }),
        ).toMatchObject({ value: { kind: 'html' } });
      }
    });

    test('the edge chain depth starts again at each parse', () => {
      const options = { maxEdgeChainDepth: 100 };
      expect(() =>
        parse(`${edgeChain(150)};`, { ...options, startRule: 'Edge' }),
      ).toThrow(dotSyntaxError({ limit: 'maxEdgeChainDepth' }));
      for (let i = 0; i < 2; i++) {
        expect(
          parse(`${edgeChain(100)};`, { ...options, startRule: 'Edge' })
            .targets,
        ).toHaveLength(101);
      }
    });

    test('a syntax error does not affect the next parse', () => {
      expect(() =>
        parse('invalid syntax here!', { startRule: 'Graph' }),
      ).toThrow(
        dotSyntaxError({
          location: { start: at(0), end: at(1) },
          limit: undefined,
        }),
      );
      expect(
        parse('digraph { a -> b; }', { startRule: 'Graph' }),
      ).toMatchObject({
        type: 'Graph',
      });
    });

    test('a syntax error after a parse stopped by a limit names no limit', () => {
      expect(() =>
        parse(`${edgeChain(150)};`, {
          startRule: 'Edge',
          maxEdgeChainDepth: 100,
        }),
      ).toThrow(dotSyntaxError({ limit: 'maxEdgeChainDepth' }));
      expect(() => parse('a -> ;', { startRule: 'Edge' })).toThrow(
        dotSyntaxError({ limit: undefined }),
      );
    });
  });
});
