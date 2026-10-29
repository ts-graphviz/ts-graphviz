/**
 * The parser against the Graphviz `dot` binary on generated DOT text.
 *
 * DOT sources are generated from Graphviz's grammar, with the separators
 * between tokens drawn from nothing, spaces, tabs, newlines and comments, so
 * tokens touch in every way the lexer has to split (`1image`, `subgraphx`,
 * `a->b`). Whenever the parser accepts a source, Graphviz must read the
 * source and the parser's reprint of it as the same graph (`dot -Tcanon`,
 * compared without regard to the order of sibling subgraphs, see
 * `sortSubgraphs`). Rejecting a source Graphviz accepts is allowed (the
 * parser fails closed); reading it differently is not: that is how
 * `1image="x"` hid an `image` attribute from `sanitize`.
 *
 * Skipped when `dot` is not installed. `FC_NUM_RUNS` raises the run count.
 */
import { spawnSync } from 'node:child_process';
import fc from 'fast-check';
import { parse, stringify } from 'ts-graphviz/ast';
import { beforeEach, describe, expect, it } from 'vitest';

let dotInstalled: boolean | undefined;
/** Whether `dot` runs, asked by the first test that needs it. */
const hasDot = () =>
  (dotInstalled ??= spawnSync('dot', ['-V'], { timeout: 10_000 }).status === 0);

/** `dot -Tcanon` of a source, or `undefined` when Graphviz rejects it. */
function canon(source: string): string | undefined {
  const r = spawnSync('dot', ['-Tcanon'], {
    input: source,
    encoding: 'utf8',
    timeout: 30_000,
  });
  return r.status === 0 ? r.stdout : undefined;
}

/** A line of canon output, or a subgraph block with its lines. */
type Item = string | { open: string; body: Item[]; close: string };

/** A line that opens a block: the graph itself or a subgraph. */
const OPENS_BLOCK = /^\t*(?:strict )?(?:di|sub)?graph\b.*\{$/;

/**
 * The items of a block, from line `from` up to the line that closes it
 * (`close`, a `}` indented like the block's first line) or the end of the
 * text. A block opener whose `}` is missing counts as a plain line.
 */
function readItems(
  lines: readonly string[],
  from: number,
  close: string | undefined,
): { items: Item[]; next: number } {
  const items: Item[] = [];
  let i = from;
  while (i < lines.length && lines[i] !== close) {
    const line = lines[i];
    if (OPENS_BLOCK.test(line)) {
      const ownClose = `${line.slice(0, line.search(/[^\t]/))}}`;
      const inner = readItems(lines, i + 1, ownClose);
      if (lines[inner.next] === ownClose) {
        items.push({ open: line, body: inner.items, close: ownClose });
        i = inner.next + 1;
        continue;
      }
    }
    items.push(line);
    i++;
  }
  return { items, next: i };
}

function* linesOf(items: readonly Item[]): Generator<string> {
  for (const item of items) {
    if (typeof item === 'string') yield item;
    else {
      yield item.open;
      yield* linesOf(item.body);
      yield item.close;
    }
  }
}

/**
 * The items with the blocks among them sorted by their text, recursively.
 * The blocks swap places only with each other: the other lines, and the
 * positions the blocks take among them, stay where they are.
 */
function sortBlocks(items: readonly Item[]): Item[] {
  const sorted = items.map((item) =>
    typeof item === 'string' ? item : { ...item, body: sortBlocks(item.body) },
  );
  const slots = sorted.flatMap((item, i) =>
    typeof item === 'string' ? [] : [i],
  );
  const blocks = slots
    .map((i) => ({
      item: sorted[i],
      text: [...linesOf([sorted[i]])].join('\n'),
    }))
    .sort((a, b) => (a.text < b.text ? -1 : a.text > b.text ? 1 : 0));
  slots.forEach((slot, j) => {
    sorted[slot] = blocks[j].item;
  });
  return sorted;
}

/**
 * `dot -Tcanon` output with the subgraphs of every block sorted by their
 * text. Graphviz lists sibling subgraphs in an order that depends on tokens
 * that do not change the graph (a `;` after an edge whose target has a port
 * and a compass point, #1775), so the source and its reprint may list the
 * same subgraphs differently. Everything else stays in order: canon prints
 * one statement per line and nests subgraphs with tabs, so the lines that
 * do not open or close a subgraph are left where they are.
 */
function sortSubgraphs(canon: string): string {
  return [
    ...linesOf(sortBlocks(readItems(canon.split('\n'), 0, undefined).items)),
  ].join('\n');
}

/**
 * What may stand between two tokens, including nothing at all. Comments and
 * newlines inside statements are rare: the parser still rejects most of
 * them, and too many would leave little it accepts to compare.
 */
const sep = fc.oneof(
  { arbitrary: fc.constant(''), weight: 6 },
  { arbitrary: fc.constant(' '), weight: 6 },
  { arbitrary: fc.constantFrom('\t', '\n'), weight: 2 },
  // Comments inside statements are kept on the nodes next to them (#1710).
  {
    arbitrary: fc.constantFrom(
      ' /* c */ ',
      '/*c*/',
      '\n# x\n',
      ' // y\n',
      '\n/* m\nn */\n',
    ),
    weight: 3,
  },
);
/** At least some whitespace (where tokens must be apart for the source to mean anything). */
const gap = fc.constantFrom(' ', '\n', '\t', ' /* c */ ', '\n// y\n');

const id = fc.oneof(
  {
    arbitrary: fc.constantFrom(
      'a',
      'b',
      'c',
      'image',
      'label',
      'color',
      'x_1',
      'é',
    ),
    weight: 6,
  },
  { arbitrary: fc.constantFrom('1', '-2', '.5', '3.', '1.5'), weight: 3 },
  // Numerals touching letters: Graphviz splits them.
  { arbitrary: fc.constantFrom('1a', '2image', '1.5x', '-1b'), weight: 2 },
  // Keywords, alone or as a prefix of an id.
  {
    arbitrary: fc.constantFrom(
      'node',
      'edge',
      'graph',
      'subgraph',
      'strict',
      'nodex',
      'subgraphs',
      'Edge',
    ),
    weight: 1,
  },
  {
    arbitrary: fc.constantFrom(
      '"a"',
      '"a b"',
      '"x\\"y"',
      '"\\\\"',
      '"l\\nm"',
      '"ima\\\nge"',
      '""',
      '"node"',
    ),
    weight: 3,
  },
  // HTML strings whose text is no other id: Graphviz interns strings by
  // text, and the first of an HTML and a plain string with the same text
  // decides what both are (`b; x [label=<b>]` makes the label plain text),
  // so a reprint that drops a port (`x:b;`) may change which comes first.
  { arbitrary: fc.constantFrom('<hb>', '<<i>x</i>>', '<a&amp;b>'), weight: 1 },
);

const join = (parts: string[]) => parts.join('');

const attribute = fc
  .tuple(id, sep, sep, id)
  .map(([k, s1, s2, v]) => join([k, s1, '=', s2, v]));

const attributeList = fc
  .tuple(
    sep,
    fc.array(fc.tuple(attribute, sep, fc.constantFrom('', ',', ';'), sep), {
      maxLength: 3,
    }),
    sep,
  )
  .map(([s1, items, s2]) =>
    join(['[', s1, ...items.map((i) => join(i)), s2, ']']),
  );

const port = fc.option(
  fc.tuple(
    sep,
    id,
    fc.option(fc.tuple(sep, fc.constantFrom('n', 'sw', '_', 'c')), {
      nil: undefined,
    }),
  ),
  { nil: undefined },
);

const nodeRef = fc
  .tuple(id, port)
  .map(([i, p]) =>
    p === undefined
      ? i
      : join([i, ':', p[0], p[1], ...(p[2] ? [':', p[2][0], p[2][1]] : [])]),
  );

function graphOf(directed: boolean): fc.Arbitrary<string> {
  const op = directed ? '->' : '--';
  return fc.letrec<{ stmts: string; target: string; subgraph: string }>(
    (tie) => ({
      subgraph: fc
        .tuple(
          fc.option(fc.tuple(gap, fc.option(id, { nil: undefined }), sep), {
            nil: undefined,
          }),
          sep,
          tie('stmts'),
        )
        .map(([header, s, body]) =>
          join([
            header
              ? join(['subgraph', header[0], header[1] ?? '', header[2]])
              : '',
            s,
            '{',
            body,
            '}',
          ]),
        ),
      target: fc.oneof(
        { depthSize: 'small', maxDepth: 2 },
        { arbitrary: nodeRef, weight: 5 },
        // `a:p, b`: a comma list keeps its ports (#1708).
        {
          arbitrary: fc
            .array(fc.tuple(nodeRef, sep, fc.constant(','), sep), {
              minLength: 1,
              maxLength: 2,
            })
            .chain((items) =>
              nodeRef.map((last) => join([...items.map(join), last])),
            ),
          weight: 1,
        },
        { arbitrary: tie('subgraph'), weight: 2 },
      ),
      stmts: fc
        .array(
          fc
            .tuple(
              fc.oneof(
                { depthSize: 'small', maxDepth: 2 },
                {
                  arbitrary: fc
                    .tuple(nodeRef, sep, fc.option(attributeList, { nil: '' }))
                    .map(join),
                  weight: 3,
                },
                {
                  arbitrary: fc
                    .tuple(
                      tie('target'),
                      fc.array(
                        fc
                          .tuple(sep, fc.constant(op), sep, tie('target'))
                          .map(join),
                        { minLength: 1, maxLength: 2 },
                      ),
                      sep,
                      fc.option(attributeList, { nil: '' }),
                    )
                    .map(([t, rest, s, a]) => join([t, ...rest, s, a])),
                  weight: 3,
                },
                {
                  arbitrary: fc
                    .tuple(
                      fc.constantFrom('graph', 'node', 'edge'),
                      sep,
                      attributeList,
                    )
                    .map(join),
                  weight: 2,
                },
                { arbitrary: attribute, weight: 2 },
                { arbitrary: tie('subgraph'), weight: 1 },
              ),
              sep,
              fc.constantFrom('', ';'),
              gap,
            )
            .map(join),
          { maxLength: 4 },
        )
        .map((s) => join([' ', ...s])),
    }),
  ).stmts;
}

const source = fc
  .tuple(
    fc.boolean(),
    fc.boolean(),
    fc.option(fc.tuple(gap, id), { nil: undefined }),
    sep,
  )
  .chain(([strict, directed, name, s]) =>
    graphOf(directed).map((body) =>
      join([
        strict ? 'strict ' : '',
        directed ? 'digraph' : 'graph',
        name ? join(name) : '',
        s,
        '{',
        body,
        '}',
      ]),
    ),
  );

describe('the parser reads DOT as Graphviz does', {
  tags: ['SM-1', 'process'],
}, () => {
  beforeEach(({ skip }) => skip(!hasDot(), 'dot is not installed'));
  // Each case runs dot twice; FC_NUM_RUNS (the nightly run) makes it long.
  it('a source it accepts and its reprint are the same graph to dot', {
    timeout: 25 * 60_000,
  }, () => {
    const runs = Number(process.env.FC_NUM_RUNS ?? 300);
    let accepted = 0;
    for (const dot of fc.sample(source, runs)) {
      let printed: string;
      try {
        printed = stringify(parse(dot));
      } catch {
        continue; // failing closed is allowed
      }
      accepted++;
      const original = canon(dot);
      expect(
        original,
        `the parser accepts what dot rejects:\n${dot}`,
      ).toBeDefined();
      const reprinted = canon(printed);
      expect(
        reprinted && sortSubgraphs(reprinted),
        `dot reads the reprint differently: ${JSON.stringify(dot)}\n--- reprint\n${printed}`,
      ).toBe(sortSubgraphs(original as string));
    }
    expect(accepted).toBeGreaterThan(runs / 10);
  });
});

/**
 * Sources dot accepts whose reprint it lists the subgraphs of in another
 * order (#1775). Each has an edge whose target has a port and a compass
 * point, after which the printer writes a `;` the source lacks.
 */
const subgraphOrderCases = [
  'strict graph .5\t{ image // y\n-- .5: c: /* c */ sw--subgraph\n// y\n"node" { }[]\ncolor =\tx_1\tsubgraph\tcolor { a/*c*/ /* c */ ; /* c */ } \n// y\n}',
  'strict graph\tcolor{ color:<<i>x</i>>: // y\nsw\n/* m\nn */\n\t; subgraph .5\t{ image=\timage \n} --"a b":\n# x\nb:sw , -2:\ta:\t_--subgraph /* c */ label /* c */  { }\n[ .5= -2; image = a  /* c */ é= image; ]  /* c */ }',
  'digraph { .5:\t"l\\nm":\n# x\n_;\nsubgraph\n// y\n3. \n{ } ; /* c */ subgraph\n// y\nx_1 { } /* c */  }',
];

describe('sortSubgraphs', () => {
  // `dot -Tcanon` of the first of `subgraphOrderCases` and of its reprint.
  const original = [
    'strict graph .5 {',
    '\tgraph [color=x_1];',
    '\tnode [label="\\N"];',
    '\tsubgraph color {',
    '\t\ta;',
    '\t}',
    '\tsubgraph "node" {',
    '\t}',
    '\timage -- .5:c:sw;',
    '}',
    '',
  ].join('\n');
  const reordered = [
    'strict graph .5 {',
    '\tgraph [color=x_1];',
    '\tnode [label="\\N"];',
    '\tsubgraph "node" {',
    '\t}',
    '\tsubgraph color {',
    '\t\ta;',
    '\t}',
    '\timage -- .5:c:sw;',
    '}',
    '',
  ].join('\n');

  it('makes outputs that differ only in the order of sibling subgraphs equal', () => {
    expect(sortSubgraphs(reordered)).toBe(sortSubgraphs(original));
    expect(sortSubgraphs(original)).toBe(reordered);
  });

  it('sorts the subgraphs nested in a subgraph too', () => {
    // `a` holds `inner`; `b` is its sibling.
    const graph = (outer: string[], inner: string[]) =>
      [
        'digraph {',
        ...outer.flatMap((name) =>
          name === 'a'
            ? [
                '\tsubgraph a {',
                ...inner.flatMap((n) => [`\t\tsubgraph ${n} {`, '\t\t}']),
                '\t}',
              ]
            : [`\tsubgraph ${name} {`, '\t}'],
        ),
        '}',
        '',
      ].join('\n');
    const sorted = graph(['a', 'b'], ['x', 'y']);
    expect(sortSubgraphs(graph(['b', 'a'], ['y', 'x']))).toBe(sorted);
    expect(sortSubgraphs(sorted)).toBe(sorted);
  });

  it('keeps the order of nodes, edges and attributes', () => {
    const swapped = original.replace(
      '\tgraph [color=x_1];\n\tnode [label="\\N"];',
      '\tnode [label="\\N"];\n\tgraph [color=x_1];',
    );
    expect(swapped).not.toBe(original);
    expect(sortSubgraphs(swapped)).not.toBe(sortSubgraphs(original));
    const nodes = 'digraph {\n\ta;\n\tb;\n}\n';
    expect(sortSubgraphs(nodes)).toBe(nodes);
    expect(sortSubgraphs('digraph {\n\tb;\n\ta;\n}\n')).not.toBe(nodes);
  });

  it('keeps the order of the statements inside a subgraph', () => {
    const body = (lines: string) =>
      `digraph {\n\tsubgraph s {\n${lines}\t}\n}\n`;
    expect(sortSubgraphs(body('\t\tb;\n\t\ta;\n'))).toBe(
      body('\t\tb;\n\t\ta;\n'),
    );
    expect(sortSubgraphs(body('\t\tb;\n\t\ta;\n'))).not.toBe(
      sortSubgraphs(body('\t\ta;\n\t\tb;\n')),
    );
  });

  it('does not hide a different edge or attribute', () => {
    for (const changed of [
      reordered.replace('image -- .5:c:sw', 'image -- .5:c:n'),
      reordered.replace('color=x_1', 'color=x_2'),
      reordered.replace('\t\ta;\n', '\t\tb;\n'),
      reordered.replace('subgraph "node" {\n\t}\n', ''),
    ]) {
      expect(changed).not.toBe(reordered);
      expect(sortSubgraphs(changed)).not.toBe(sortSubgraphs(original));
    }
  });

  it('leaves text that is not canon output alone', () => {
    for (const text of [
      '',
      'digraph {',
      'digraph {\n\tsubgraph s {\n',
      'x\n}\n',
    ]) {
      expect(sortSubgraphs(text)).toBe(text);
    }
  });
});

describe('dot and the order of subgraphs (#1775)', {
  tags: ['SM-1', 'process'],
}, () => {
  beforeEach(({ skip }) => skip(!hasDot(), 'dot is not installed'));

  it.each(subgraphOrderCases)(
    'reads the source and its reprint as the same graph up to subgraph order: %j',
    { timeout: 60_000 },
    (dot) => {
      const original = canon(dot);
      const reprinted = canon(stringify(parse(dot)));
      expect(original).toBeDefined();
      expect(reprinted).toBeDefined();
      expect(sortSubgraphs(reprinted as string)).toBe(
        sortSubgraphs(original as string),
      );
    },
  );

  it('still tells a reprint that changes the graph apart', {
    timeout: 60_000,
  }, () => {
    const dot = subgraphOrderCases[0];
    const original = sortSubgraphs(canon(dot) as string);
    for (const changed of [
      dot.replace('sw--', 'n--'), // another compass point
      dot.replace('x_1', 'x_2'), // another attribute value
      dot.replace('{ a/*c*/', '{ b/*c*/'), // another node in a subgraph
      dot.replace('"node" { }', '{ }'), // the subgraph without its name
    ]) {
      expect(changed).not.toBe(dot);
      expect(sortSubgraphs(canon(changed) as string)).not.toBe(original);
    }
  });
});
