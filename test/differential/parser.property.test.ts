/**
 * The parser against the Graphviz `dot` binary on generated DOT text.
 *
 * DOT sources are generated from Graphviz's grammar, with the separators
 * between tokens drawn from nothing, spaces, tabs, newlines and comments, so
 * tokens touch in every way the lexer has to split (`1image`, `subgraphx`,
 * `a->b`). Whenever the parser accepts a source, Graphviz must read the
 * source and the parser's reprint of it as the same graph (`dot -Tcanon`).
 * Rejecting a source Graphviz accepts is allowed (the parser fails closed);
 * reading it differently is not: that is how `1image="x"` hid an `image`
 * attribute from `sanitize`.
 *
 * Skipped when `dot` is not installed. `FC_NUM_RUNS` raises the run count.
 */
import { spawnSync } from 'node:child_process';
import fc from 'fast-check';
import { parse, stringify } from 'ts-graphviz/ast';
import { describe, expect, it } from 'vitest';

const hasDot = spawnSync('dot', ['-V']).status === 0;

/** `dot -Tcanon` of a source, or `undefined` when Graphviz rejects it. */
function canon(source: string): string | undefined {
  const r = spawnSync('dot', ['-Tcanon'], { input: source, encoding: 'utf8' });
  return r.status === 0 ? r.stdout : undefined;
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

describe.skipIf(!hasDot)(
  'the parser reads DOT as Graphviz does',
  { tags: ['SM-1'] },
  () => {
    it('a source it accepts and its reprint are the same graph to dot', () => {
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
        expect(
          canon(printed),
          `dot reads the reprint differently: ${JSON.stringify(dot)}\n--- reprint\n${printed}`,
        ).toBe(original);
      }
      expect(accepted).toBeGreaterThan(runs / 10);
    });
  },
);
