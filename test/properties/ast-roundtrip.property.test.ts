import fc from 'fast-check';
import { type Compass, Dot, defaultModelsContext, toDot } from 'ts-graphviz';
import {
  type ASTNode,
  createElement,
  fromModel,
  type LiteralASTNode,
  type LiteralKind,
  parse,
  parseFragment,
  stringify,
  toModel,
} from 'ts-graphviz/ast';
import { describe, expect, it } from 'vitest';
import { buildGraph, graphSpec } from './arbitraries.js';
import {
  attribute,
  attributeList,
  COMPASS_POINTS,
  dot,
  edge,
  graph,
  node,
  normalize,
} from './ast-arbitraries.js';
import { summarize } from './summarize.js';

// Property-based tests for the AST layer (see #1612): the printer and parser
// as a pair, and fromModel/toModel as a pair. A failing run prints its seed;
// reproduce it with FC_SEED=<seed>.

const models = defaultModelsContext();

describe('[SM-1] printer and parser', () => {
  it('parse(stringify(ast)) rebuilds the same tree', () => {
    fc.assert(
      fc.property(dot, (ast) => {
        expect(normalize(parse(stringify(ast)))).toStrictEqual(normalize(ast));
      }),
    );
  });

  it('stringify is stable: printing a parsed print changes nothing', () => {
    fc.assert(
      fc.property(dot, (ast) => {
        const text = stringify(ast);
        expect(stringify(parse(text))).toBe(text);
      }),
    );
  });

  it('every statement kind parses back on its own', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          node.map((n) => ['Node', n] as const),
          edge.map((e) => ['Edge', e] as const),
          attribute.map((a) => ['Attribute', a] as const),
          attributeList.map((a) => ['AttributeList', a] as const),
          graph.map((g) => ['Graph', g] as const),
        ),
        ([startRule, ast]) => {
          // The rule is a union here, which the overloads do not take yet
          // (#1741); each of these rules gives one node.
          const parsed = (
            parseFragment as (input: string, rule: string) => ASTNode
          )(stringify(ast), startRule);
          expect(normalize(parsed)).toStrictEqual(normalize(ast));
        },
      ),
    );
  });

  describe('node ports and compass points', () => {
    const bare = <T extends string>(value: T): LiteralASTNode<T> => ({
      ...createElement('Literal', { value, kind: 'bare' }, []),
      value,
    });
    const edgeTo = (port?: string, compass?: string) =>
      createElement(
        'Edge',
        {
          targets: [
            createElement(
              'NodeRef',
              {
                id: bare('a'),
                ...(port ? { port: bare(port) } : {}),
                ...(compass ? { compass: bare(compass as Compass) } : {}),
              },
              [],
            ),
            createElement('NodeRef', { id: bare('b') }, []),
          ],
        },
        [],
      );
    const reparse = (ast: ASTNode) =>
      normalize(parse(stringify(ast), { startRule: 'Edge' }));

    // #1619: two-letter points were split by ordered choice, `c` and `_`
    // were missing, and a compass point without a port was read as a port
    it.each(COMPASS_POINTS)(
      'a port with the compass point %s round-trips',
      (compass) => {
        const ast = edgeTo('p', compass);
        expect(reparse(ast)).toStrictEqual(normalize(ast));
      },
    );

    it.each(COMPASS_POINTS)(
      'the compass point %s alone stays a compass point',
      (compass) => {
        const ast = edgeTo(undefined, compass);
        expect(reparse(ast)).toStrictEqual(normalize(ast));
      },
    );
  });
});

describe('fromModel and toModel', () => {
  // Integer-like attribute keys keep their position through the model since
  // #1626, so every generated document is convertible.
  const convertible = dot;

  it('toModel(fromModel(dot)) describes the same graphs', () => {
    // Through a Dot model, so that the root graph's comment is covered too:
    // comments are emitted by the parent, and a root graph's parent is Dot.
    fc.assert(
      fc.property(
        fc.array(graphSpec, { minLength: 1, maxLength: 2 }),
        (specs) => {
          const model = new Dot();
          for (const spec of specs) model.addGraph(buildGraph(spec));
          const back = toModel(fromModel(model), { models });
          expect(back.graphs.map(summarize)).toStrictEqual(
            model.graphs.map(summarize),
          );
        },
      ),
    );
  });

  it('fromModel(toModel(ast)) is a fixpoint after one conversion', () => {
    // The first conversion normalizes (merges attribute statements, orders
    // statements); converting the result again must change nothing.
    fc.assert(
      fc.property(convertible, (ast) => {
        const once = fromModel(toModel(ast, { models }));
        const twice = fromModel(toModel(once, { models }));
        expect(normalize(twice)).toStrictEqual(normalize(once));
      }),
    );
  });

  it('a parsed file converts to models and prints to text that parses again', () => {
    fc.assert(
      fc.property(dot, (ast) => {
        const parsed = parse(stringify(ast));
        const text = toDot(toModel(parsed, { models }));
        expect(() => parse(text)).not.toThrow();
      }),
    );
  });

  it('attribute values come back in their normalized quoting (#1589, #1629)', () => {
    // The model keeps the value, not the source text: a bare numeral that is
    // the exact text of its number, and `true`/`false`, come back bare;
    // every other string is literal text and is written quoted; HTML strings
    // stay HTML strings. One node with unique keys, so each attribute can be
    // compared to its original.
    const expectedKind = (value: LiteralASTNode): LiteralKind => {
      if (value.kind === 'html') return 'html';
      if (value.kind === 'bare') {
        if (value.value === 'true' || value.value === 'false') return 'bare';
        if (String(Number(value.value)) === value.value) return 'bare';
      }
      return 'quoted';
    };
    const attributesOf = (n: { children: ASTNode[] }) =>
      n.children.filter(
        (c): c is ASTNode & { key: LiteralASTNode; value: LiteralASTNode } =>
          c.type === 'Attribute',
      );
    // Keys are bare identifiers so that they match themselves after the
    // round trip (quoted keys are re-escaped).
    const identifierKeyed = attribute.filter(
      (a) => a.key.kind === 'bare' && /^[A-Za-z_]/.test(a.key.value),
    );
    const nodeWithUniqueKeys = fc
      .tuple(
        node,
        fc.uniqueArray(identifierKeyed, {
          minLength: 1,
          maxLength: 4,
          selector: (a) => a.key.value,
        }),
      )
      .map(([n, attrs]) => createElement('Node', { id: n.id }, attrs));
    fc.assert(
      fc.property(nodeWithUniqueKeys, (ast) => {
        const back = fromModel(toModel(ast, { models }));
        expect(
          attributesOf(back).map((a) => [a.key.value, a.value.kind]),
        ).toStrictEqual(
          attributesOf(ast).map((a) => [a.key.value, expectedKind(a.value)]),
        );
      }),
    );
  });
});
