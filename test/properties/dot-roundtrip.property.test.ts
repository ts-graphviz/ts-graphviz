import { parse, stringify, toModel } from '@ts-graphviz/ast';
import fc from 'fast-check';
import {
  defaultModelsContext,
  digraph,
  escString,
  fromDot,
  htmlLike,
  isTsGraphvizError,
  toDot,
} from 'ts-graphviz';

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

describe('[SM-2] DOT round trip', () => {
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
        defaults: { graph: [], node: [], edge: [] },
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
        defaults: { graph: [], node: [], edge: [] },
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
        defaults: { graph: [], node: [], edge: [] },
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
        defaults: { graph: [], node: [], edge: [] },
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
          defaults: { graph: [], node: [], edge: [] },
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

describe('[SM-3] explicit value kinds', () => {
  // DOT text carries no kind marker, so an escString without Graphviz escapes
  // reads back as plain text; what must hold is that printing is idempotent
  // and that no value can break out of its string.
  const escStringValue = dotString({ newlines: true }).map(escString);
  const htmlLikeValue = fc
    .tuple(
      fc.constantFrom('b', 'i', 'table', 'font color="red"'),
      dotString({ newlines: true }).filter((s) => !/[<>]/.test(s)),
    )
    .map(([tag, text]) => htmlLike(`<${tag}>${text}</${tag.split(' ')[0]}>`));

  it('escString values print idempotently and never break out of the string', () => {
    fc.assert(
      fc.property(escStringValue, (value) => {
        const g = digraph((g) => {
          g.node('a', { label: value });
        });
        const dot = toDot(g);
        const again = fromDot(dot);
        expect(again.nodes).toHaveLength(1);
        expect(toDot(again)).toBe(dot);
      }),
    );
  });

  it('htmlLike values round-trip exactly', () => {
    fc.assert(
      fc.property(htmlLikeValue, (value) => {
        const g = digraph((g) => {
          g.node('a', { label: value });
        });
        const again = fromDot(toDot(g));
        expect(again.nodes[0].attributes.get('label')).toStrictEqual(value);
      }),
    );
  });

  it('any JS number produces DOT that parses back to the same number', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.double(),
          fc.integer(),
          fc.constantFrom(1e21, 1e-7, 5e-324),
        ),
        (n) => {
          const g = digraph((g) => {
            g.node('a', { fontsize: n });
          });
          const again = fromDot(toDot(g));
          const raw = again.nodes[0].attributes.get('fontsize');
          expect(raw).toBeDefined();
          const back = Number(raw);
          // DOT has no signed zero, so -0 reads back as 0
          expect(back === n || (Number.isNaN(back) && Number.isNaN(n))).toBe(
            true,
          );
        },
      ),
    );
  });

  it('writes non-numeral numbers as strings and keeps a __proto__ key', () => {
    // deterministic cases the properties above cannot distinguish by coercion
    const g = digraph((g) => {
      g.node('a', { fontsize: Number.NaN, width: Number.POSITIVE_INFINITY });
      // computed key: a literal `__proto__:` would set the prototype instead
      g.node('b', { ['__proto__']: 'v' } as unknown as { label: string });
    });
    const dot = toDot(g);
    expect(dot).toContain('fontsize = "NaN";');
    expect(dot).toContain('width = "Infinity";');
    // `__proto__` is an ordinary identifier in DOT; it only needs care when parsed
    expect(dot).toContain('__proto__ = "v";');
    const again = fromDot(dot);
    expect(again.nodes[1].attributes.get('__proto__' as 'label')).toBe('v');
    expect(Object.getPrototypeOf(again.nodes[1].attributes)).not.toBe('v');
  });

  it('attribute keys that are DOT keywords or not identifiers are quoted', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constantFrom(
            'node',
            'Edge',
            'GRAPH',
            'subgraph',
            'strict',
            'digraph',
          ),
          dotString().filter((s) => s !== ''),
        ),
        (key) => {
          const g = digraph((g) => {
            g.node('a', { [key]: 'v' } as { label: string });
          });
          const again = fromDot(toDot(g));
          expect(again.nodes[0].attributes.get(key as 'label')).toBe('v');
        },
      ),
    );
  });

  it('unbalanced HTML-like markup is rejected rather than written', () => {
    fc.assert(
      fc.property(
        dotString().filter((s) => s.includes('>')),
        (s) => {
          expect(() => htmlLike(`${s}<`)).toThrow(
            expect.objectContaining({ code: 'TSG_ERR_INVALID_HTML_LIKE' }),
          );
        },
      ),
    );
  });
});

describe('[SM-1] parser robustness', () => {
  // Every error the library raises carries a TSG_ERR_* code (#776, #1627);
  // anything else is a crash.
  const allowed = (error: unknown) => isTsGraphvizError(error);

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
        expect(() =>
          parse(toDot(toModel(ast, { models: defaultModelsContext() }))),
        ).not.toThrow();
      }),
      { numRuns: 500 },
    );
  });
});

describe('[SM-2] attribute values of every kind', () => {
  // The value kinds the model accepts, including the ones DOT writes bare.
  const anyValue = fc.oneof(
    dotString({ newlines: true }),
    fc.double({ noNaN: true, noDefaultInfinity: true }),
    fc.integer(),
    fc.boolean(),
    dotString({ newlines: true }).map(escString),
    dotString()
      .filter((s) => !/[<>]/.test(s))
      .map((s) => htmlLike(`<b>${s}</b>`)),
  );

  it('toDot never throws and its output always parses', () => {
    fc.assert(
      fc.property(anyValue, anyValue, (label, tooltip) => {
        const g = digraph((g) => {
          g.set('label', label);
          g.node('a', { tooltip });
        });
        const dot = toDot(g);
        expect(() => fromDot(dot)).not.toThrow();
      }),
    );
  });

  it('fromDot(toDot(g)) preserves strict and directed for every graph', () => {
    fc.assert(
      fc.property(graphSpec, (spec) => {
        const again = fromDot(toDot(buildGraph(spec)));
        expect([again.strict, again.directed]).toStrictEqual([
          spec.strict,
          spec.directed,
        ]);
      }),
    );
  });

  it('numbers and booleans come back with their type (#1629)', () => {
    // DOT writes them bare, and a bare numeral or boolean reads back typed.
    fc.assert(
      fc.property(fc.oneof(fc.integer(), fc.boolean()), (value) => {
        const g = digraph((g) => {
          g.node('a', { fontsize: value as number });
        });
        expect(fromDot(toDot(g)).nodes[0].attributes.get('fontsize')).toBe(
          value,
        );
      }),
    );
  });
});
