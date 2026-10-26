import { parse, stringify } from '@ts-graphviz/ast';
import { describe, expect, it } from 'vitest';

/** A small seeded PRNG (mulberry32), so failures can be replayed. */
function random(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (n: number) => Math.floor(next() * n);
  const pick = <T>(items: readonly T[]) => items[int(items.length)];
  return { int, pick };
}

describe('printing random nested graphs', () => {
  function graph(seed: number): string {
    const { int, pick } = random(seed);
    const id = () => pick(['a', 'b', 'c', '"q q"', '1', '-2.5', 'node_1']);
    const attrs = () =>
      int(3) === 0
        ? ''
        : ` [${pick(['label', 'color', 'shape'])}=${pick(['x', '"y z"', '<<b>h</b>>', '2'])}${int(2) ? ', k=v' : ''}]`;
    const comment = () =>
      pick([
        '/* c */',
        '// e',
        '# f',
        '/*g*/',
        '/* a\n b */',
        '/*\n  a\n   b\n*/',
        '# f\n# g',
        '# f\n#  g',
        '// e\n//  h',
      ]);
    function body(depth: number): string {
      const items: string[] = [];
      const n = 1 + int(4);
      for (let i = 0; i < n; i++) {
        const kind = int(depth > 6 ? 4 : 6);
        if (kind === 0) items.push(`${id()}${attrs()};`);
        else if (kind === 1)
          items.push(
            `${id()}${Array.from({ length: 1 + int(3) }, () => ` -> ${int(2) ? id() : `{${id()} ${id()}}`}`).join('')}${attrs()};`,
          );
        else if (kind === 2)
          items.push(
            `${pick(['graph', 'node', 'edge'])}${attrs() || ' [k=v]'};`,
          );
        else if (kind === 3) items.push(`${comment()}\n${id()};`);
        else if (kind === 4)
          items.push(`subgraph ${int(2) ? id() : ''} { ${body(depth + 1)} }`);
        else items.push(`{ ${body(depth + 1)} }`);
      }
      return items.join(' ');
    }
    return `digraph G { ${body(1)} }`;
  }

  const strip = (ast: unknown): unknown =>
    JSON.parse(
      JSON.stringify(ast, (k, v) => (k === 'location' ? undefined : v)),
    );

  it('reads back the same AST and prints it the same again', () => {
    const optionSets = [
      {},
      { indentStyle: 'tab' as const },
      { indentSize: 0 },
      { indentSize: 3, endOfLine: 'crlf' as const },
    ];
    for (let seed = 1; seed <= 300; seed++) {
      const source = graph(seed);
      const ast = parse(source);
      for (const options of optionSets) {
        const printed = stringify(ast, options);
        const again = parse(printed);
        expect(strip(again), `seed ${seed}`).toStrictEqual(strip(ast));
        expect(stringify(again, options), `seed ${seed}`).toBe(printed);
      }
    }
  });
});
