import {
  ASTNodeCountExceededError,
  DotSyntaxError,
  parse,
  stringify,
  toModel,
} from '@ts-graphviz/ast';
import fc from 'fast-check';
import { fromDot, toDot } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import {
  buildGraph,
  dotString,
  type GraphSpec,
  graphSpec,
  looksHtmlLikeToPrinter,
} from './arbitraries.js';
import { summarize } from './summarize.js';

// Property-based tests for the DOT printer and parser (see #1504).
// A failing run prints its seed; reproduce it with FC_SEED=<seed>.

const roundTrip = (spec: Parameters<typeof buildGraph>[0]) => {
  const model = buildGraph(spec);
  const dot = toDot(model);
  return { model, dot, reparsed: fromDot(dot) };
};

describe('DOT round trip', () => {
  // Backslashes have no defined meaning in model strings today (#1587): the
  // printer passes them through, so `\\"` breaks out of the string and `\"`
  // comes back as `"`. These properties are expected to fail until #1587
  // lands; vitest then reports them as unexpectedly passing.
  it('no DOT injection: any string survives toDot -> fromDot unchanged (#1587)', () => {
    fc.assert(
      fc.property(graphSpec, (spec) => {
        const { model, reparsed } = roundTrip(spec);
        expect(summarize(reparsed)).toStrictEqual(summarize(model));
      }),
    );
  });

  it('printing is idempotent: toDot(fromDot(dot)) === dot (#1587)', () => {
    fc.assert(
      fc.property(graphSpec, (spec) => {
        const { dot } = roundTrip(spec);
        expect(toDot(fromDot(dot))).toBe(dot);
      }),
    );
  });

  describe('minimal counterexamples once found by the properties (#1587)', () => {
    it('a value ending in backslashes breaks out of the string', () => {
      const { dot } = roundTrip({
        directed: true,
        strict: false,
        attributes: [],
        nodes: [{ id: 'a', attributes: [['label', '\\\\"a']] }],
        edges: [],
        subgraphs: [],
      });
      expect(() => fromDot(dot)).not.toThrow();
    });

    it('a string that looks like an HTML-like label is emitted unquoted', () => {
      // `/^<.+>$/` decides that `<>>` is HTML-like, so it is printed as `<<>>>`
      const { model, reparsed } = roundTrip({
        directed: true,
        strict: false,
        attributes: [['label', '<>>']],
        nodes: [{ id: 'a', attributes: [] }],
        edges: [],
        subgraphs: [],
      });
      expect(reparsed.get('label')).toBe(model.get('label'));
    });

    it('a multi-line value whose first line looks like a tag is emitted unquoted', () => {
      // the heuristic's `m` flag anchors per line, so `<a>\na` counts as HTML-like
      const { model, reparsed } = roundTrip({
        directed: true,
        strict: false,
        attributes: [['label', '<a>\na']],
        nodes: [{ id: 'a', attributes: [] }],
        edges: [],
        subgraphs: [],
      });
      expect(reparsed.get('label')).toBe(model.get('label'));
    });

    it('an escaped quote is not preserved', () => {
      const { model, reparsed } = roundTrip({
        directed: true,
        strict: false,
        attributes: [['label', '\\"']],
        nodes: [{ id: 'a', attributes: [] }],
        edges: [],
        subgraphs: [],
      });
      expect(reparsed.get('label')).toBe(model.get('label'));
    });
  });

  it('strings without backslashes or HTML-like shape survive toDot -> fromDot unchanged', () => {
    // Backslashes and `<...>` strings are the two cases #1587 settles.
    const settledBy1587 = (s: string) =>
      s.includes('\\') || looksHtmlLikeToPrinter(s);
    const values = (spec: GraphSpec) => [
      spec.id,
      spec.comment,
      ...spec.attributes.map(([, v]) => v),
      ...spec.nodes.flatMap((n) => [n.id, ...n.attributes.map(([, v]) => v)]),
      ...spec.edges.flatMap((e) => e.attributes.map(([, v]) => v)),
      ...spec.subgraphs.flatMap((s) => [s.id, ...s.nodes]),
    ];
    fc.assert(
      fc.property(
        graphSpec.filter(
          (spec) =>
            !values(spec).some((v) => v !== undefined && settledBy1587(v)),
        ),
        (spec) => {
          const { model, reparsed } = roundTrip(spec);
          expect(summarize(reparsed)).toStrictEqual(summarize(model));
        },
      ),
    );
  });

  it('raw newlines in values survive toDot -> fromDot (#1578)', () => {
    // A JS newline is written as the `\n` escape and read back as a newline.
    fc.assert(
      fc.property(dotString({ newlines: true }), (value) => {
        const { reparsed } = roundTrip({
          directed: true,
          strict: false,
          attributes: [['label', value]],
          nodes: [{ id: 'a', attributes: [] }],
          edges: [],
          subgraphs: [],
        });
        expect(reparsed.get('label')).toBe(value);
      }),
    );
  });
});

describe('parser robustness', () => {
  const allowed = (error: unknown) =>
    error instanceof DotSyntaxError ||
    error instanceof ASTNodeCountExceededError;

  const tokenSoup = fc
    .array(
      fc.constantFrom(
        'graph',
        'digraph',
        'strict',
        'subgraph',
        'node',
        'edge',
        '{',
        '}',
        '[',
        ']',
        ';',
        ',',
        '=',
        '->',
        '--',
        ':',
        '"',
        '\\',
        '<',
        '>',
        '/*',
        '*/',
        '//',
        '#',
        '\n',
        ' ',
        'a',
        '1',
      ),
      { maxLength: 40 },
    )
    .map((tokens) => tokens.join(''));

  it('arbitrary input either parses or throws a typed error', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string({ unit: 'binary', maxLength: 200 }),
          fc.string({ unit: 'grapheme', maxLength: 200 }),
          tokenSoup,
        ),
        (input) => {
          try {
            parse(input);
          } catch (error) {
            if (!allowed(error)) throw error;
          }
        },
      ),
      { numRuns: 1000 },
    );
  });

  it('whatever parses can be printed and parsed again', () => {
    fc.assert(
      fc.property(tokenSoup, (input) => {
        let ast: ReturnType<typeof parse>;
        try {
          ast = parse(input);
        } catch (error) {
          if (!allowed(error)) throw error;
          return;
        }
        // AST -> DOT -> AST, and AST -> model -> DOT -> AST
        expect(() => parse(stringify(ast))).not.toThrow();
        expect(() => parse(toDot(toModel(ast)))).not.toThrow();
      }),
      { numRuns: 500 },
    );
  });
});
