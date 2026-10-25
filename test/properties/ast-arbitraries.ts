import type { Compass } from '@ts-graphviz/common';
import fc from 'fast-check';
import {
  type ASTNode,
  type AttributeASTNode,
  type AttributeListASTNode,
  type ClusterStatementASTNode,
  type CommentASTNode,
  createElementFactory,
  type DotASTNode,
  type EdgeASTNode,
  type EdgeTargetASTNode,
  type GraphASTNode,
  type LiteralASTNode,
  type NodeASTNode,
  type NodeRefASTNode,
  type SubgraphASTNode,
} from 'ts-graphviz/ast';

// Generators for AST nodes, built with the public builder API. They produce
// ASTs the printer can write and the parser can read back *exactly*, so every
// constraint below mirrors a rule of the DOT grammar; a constraint that only
// exists to dodge a bug is marked with its issue number.

// The exported `createElement` shares one node counter for the whole process
// and throws after 100,000 nodes (#1624); sampling needs far more than that.
const createElement = createElementFactory({ maxASTNodes: 0 });

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = LOWER.toUpperCase();
const DIGITS = '0123456789';
const DOT_KEYWORD = /^(graph|digraph|strict|node|edge|subgraph)$/i;

/** Every compass point Graphviz accepts. */
export const COMPASS_POINTS = [
  'n',
  'ne',
  'e',
  'se',
  's',
  'sw',
  'w',
  'nw',
  'c',
  '_',
] as const satisfies readonly Compass[];

const join = (parts: string[]) => parts.join('');

/** An identifier DOT accepts without quotes (ASCII subset). */
const bareIdText = fc
  .tuple(
    fc.constantFrom(...LOWER, ...UPPER, '_'),
    fc.array(fc.constantFrom(...LOWER, ...UPPER, ...DIGITS, '_'), {
      maxLength: 6,
    }),
  )
  .map(([first, rest]) => first + join(rest))
  .filter((s) => !DOT_KEYWORD.test(s));

/** `[-]?(.[0-9]+ | [0-9]+(.[0-9]*)?)`, exactly the grammar's NUMBER. */
const numeralText = fc
  .tuple(
    fc.constantFrom('', '-'),
    fc.oneof(
      fc.nat({ max: 999 }).map(String),
      fc.nat({ max: 99 }).map((n) => `${n}.`),
      fc
        .tuple(fc.nat({ max: 99 }), fc.nat({ max: 99 }))
        .map(([a, b]) => `${a}.${b}`),
      fc.nat({ max: 99 }).map((n) => `.${n}`),
    ),
  )
  .map(join);

/**
 * Raw text inside a quoted string, as the parser keeps it: escape sequences
 * and raw line endings stay as written. Pieces are whole escape pairs, so a
 * backslash can never pair with the closing quote or with a following newline
 * (which would be a line continuation and disappear).
 */
const quotedRawText = fc
  .array(
    fc.constantFrom(
      'a',
      'Z',
      '0',
      ' ',
      '\t',
      '\n',
      '\r\n',
      '\\"',
      '\\\\',
      '\\n',
      '\\l',
      '\\N',
      '\\x',
      '<',
      '>',
      '{',
      '}',
      '[',
      ']',
      ';',
      '=',
      ':',
      '-',
      '/',
      '*',
      '#',
      '日本語',
      '😀',
      'graph',
    ),
    { maxLength: 6 },
  )
  .map(join);

/** Balanced markup for an HTML string; `<>` (empty) is valid too. */
const htmlRawText: fc.Arbitrary<string> = fc.letrec<{
  text: string;
  markup: string;
}>((tie) => ({
  text: fc
    .array(fc.constantFrom(...LOWER, ' ', '"', '&amp;', '\\'), {
      maxLength: 6,
    })
    .map(join),
  markup: fc.oneof(
    { depthSize: 'small' },
    { arbitrary: tie('text'), weight: 2 },
    {
      arbitrary: fc
        .tuple(
          fc.constantFrom('b', 'i', 'br/', 'font color="red"', 'table'),
          tie('text'),
        )
        .map(([tag, text]) => `<${tag}>${text}</${tag.split(/[ /]/)[0]}>`),
      weight: 1,
    },
    {
      arbitrary: fc
        .tuple(tie('text'), tie('markup'), tie('text'))
        .map(([a, inner, b]) => `${a}<tr><td>${inner}</td></tr>${b}`),
      weight: 1,
    },
  ),
})).markup;

const literal = <T extends string>(
  value: T,
  quoted: boolean | 'html',
): LiteralASTNode<T> =>
  createElement('Literal', { value, quoted }, []) as LiteralASTNode<T>;

/** A literal usable as an id: bare identifier, numeral or quoted string. */
const idLiteral: fc.Arbitrary<LiteralASTNode> = fc.oneof(
  { arbitrary: bareIdText.map((v) => literal(v, false)), weight: 3 },
  { arbitrary: numeralText.map((v) => literal(v, false)), weight: 1 },
  { arbitrary: quotedRawText.map((v) => literal(v, true)), weight: 3 },
);

/** Any literal, including HTML strings. */
const valueLiteral: fc.Arbitrary<LiteralASTNode> = fc.oneof(
  { arbitrary: idLiteral, weight: 5 },
  { arbitrary: htmlRawText.map((v) => literal(v, 'html')), weight: 1 },
);

const compassLiteral: fc.Arbitrary<LiteralASTNode<Compass>> = fc
  .tuple(fc.constantFrom(...COMPASS_POINTS), fc.boolean())
  .map(([value, quoted]) => literal<Compass>(value, quoted));

/**
 * A port name. Compass points are excluded: `a:n` is a compass point in DOT,
 * not a port, and the parser cannot tell the two apart afterwards. ':' is
 * excluded because Graphviz reads `"p:q"` as port:compass, so a model port
 * cannot hold it and toDot rejects it (#1641).
 */
const portLiteral = idLiteral.filter(
  (l) =>
    !l.value.includes(':') &&
    !(COMPASS_POINTS as readonly string[]).includes(l.value),
);

const nodeRef: fc.Arbitrary<NodeRefASTNode> = fc
  .tuple(
    idLiteral,
    fc.option(portLiteral, { nil: undefined }),
    fc.option(compassLiteral, { nil: undefined }),
  )
  .map(([id, port, compass]) =>
    createElement(
      'NodeRef',
      {
        id,
        ...(port ? { port } : {}),
        ...(compass ? { compass } : {}),
      },
      [],
    ),
  );

const edgeTarget: fc.Arbitrary<EdgeTargetASTNode> = fc.oneof(
  { arbitrary: nodeRef, weight: 4 },
  {
    arbitrary: fc
      .array(nodeRef, { minLength: 1, maxLength: 3 })
      .map((refs) => createElement('NodeRefGroup', {}, refs)),
    weight: 1,
  },
);

export const attribute: fc.Arbitrary<AttributeASTNode> = fc
  .tuple(idLiteral, valueLiteral)
  .map(([key, value]) => createElement('Attribute', { key, value }, []));

const attributes = fc.array(attribute, { maxLength: 3 });

export const attributeList: fc.Arbitrary<AttributeListASTNode> = fc
  .tuple(fc.constantFrom('Graph', 'Node', 'Edge'), attributes)
  .map(([kind, children]) =>
    createElement('AttributeList', { kind }, children),
  );

export const node: fc.Arbitrary<NodeASTNode> = fc
  .tuple(idLiteral, attributes)
  .map(([id, children]) => createElement('Node', { id }, children));

export const edge: fc.Arbitrary<EdgeASTNode> = fc
  .tuple(
    edgeTarget,
    edgeTarget,
    fc.array(edgeTarget, { maxLength: 2 }),
    attributes,
  )
  .map(([from, to, rest, children]) =>
    createElement('Edge', { targets: [from, to, ...rest] }, children),
  );

/**
 * Comment text that survives the printer's padding and the parser's dedent:
 * non-empty lines without surrounding whitespace. `*` is left out until the
 * parser stops removing every asterisk from block comments (#1625).
 */
const commentLine = fc
  .tuple(
    fc.constantFrom(...LOWER),
    fc.array(fc.constantFrom(...LOWER, ' ', '/', '#'), { maxLength: 8 }),
    fc.constantFrom(...LOWER),
  )
  .map(([a, mid, b]) => a + join(mid) + b);

const comment: fc.Arbitrary<CommentASTNode> = fc
  .tuple(
    fc.constantFrom('Block', 'Slash', 'Macro'),
    fc.array(commentLine, { minLength: 1, maxLength: 3 }),
  )
  .map(([kind, lines]) =>
    createElement('Comment', { kind, value: lines.join('\n') }, []),
  );

/**
 * The parser joins consecutive `//` (or `#`) lines into one comment, so two
 * such comments in a row cannot come back as two.
 */
function withoutMergedComments<T extends ASTNode>(statements: T[]): T[] {
  return statements.filter((stmt, i) => {
    const prev = statements[i - 1];
    return !(
      stmt.type === 'Comment' &&
      stmt.kind !== 'Block' &&
      prev?.type === 'Comment' &&
      prev.kind === stmt.kind
    );
  });
}

/** Statements inside a graph or subgraph; subgraphs nest a few levels deep. */
const clusterStatements: fc.Arbitrary<ClusterStatementASTNode[]> = fc.letrec<{
  subgraph: SubgraphASTNode;
  statements: ClusterStatementASTNode[];
}>((tie) => ({
  subgraph: fc
    .tuple(fc.option(idLiteral, { nil: undefined }), tie('statements'))
    .map(([id, children]) =>
      createElement('Subgraph', id ? { id } : {}, children),
    ),
  statements: fc
    .array(
      fc.oneof(
        { depthSize: 'small', maxDepth: 3 },
        { arbitrary: node, weight: 4 },
        { arbitrary: edge, weight: 4 },
        { arbitrary: attribute, weight: 2 },
        { arbitrary: attributeList, weight: 2 },
        { arbitrary: comment, weight: 1 },
        { arbitrary: tie('subgraph'), weight: 1 },
      ),
      { maxLength: 6 },
    )
    .map(withoutMergedComments),
})).statements;

export const graph: fc.Arbitrary<GraphASTNode> = fc
  .tuple(
    fc.boolean(),
    fc.boolean(),
    fc.option(idLiteral, { nil: undefined }),
    clusterStatements,
  )
  .map(([directed, strict, id, children]) =>
    createElement(
      'Graph',
      { directed, strict, ...(id ? { id } : {}) },
      children,
    ),
  );

/** A DOT file: comments and one or two root graphs. */
export const dot: fc.Arbitrary<DotASTNode> = fc
  .tuple(
    fc.array(comment, { maxLength: 1 }),
    graph,
    fc.option(graph, { nil: undefined }),
    fc.array(comment, { maxLength: 1 }),
  )
  .map(([before, first, second, after]) =>
    createElement('Dot', {}, [
      ...before,
      first,
      ...(second ? [second] : []),
      ...after,
    ]),
  );

/**
 * A plain copy of an AST without `location` and without `undefined`-valued
 * properties, for structural comparison between built and parsed trees.
 */
export function normalize<T extends ASTNode>(ast: T): T {
  return JSON.parse(
    JSON.stringify(ast, (key, value) =>
      key === 'location' ? undefined : value,
    ),
  );
}
