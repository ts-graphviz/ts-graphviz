import { Digraph, Subgraph, type SubgraphModel } from 'ts-graphviz';
import { parse, stringify } from 'ts-graphviz/ast';
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

describe('subgraph index against a reference model', () => {
  // The reference: subgraphs in insertion order, looked up by a linear
  // search, as getSubgraph did before it was indexed.
  it('agrees after every command', () => {
    const ids = ['a', 'b', 'c', 'cluster_x', undefined];
    for (let seed = 1; seed <= 200; seed++) {
      const { int, pick } = random(seed);
      const g = new Digraph();
      const reference: SubgraphModel[] = [];
      const known: SubgraphModel[] = [];
      const log: string[] = [];
      for (let step = 0; step < 60; step++) {
        const command = int(6);
        if (command === 0) {
          const id = pick(ids);
          const s =
            id === undefined ? g.createSubgraph() : g.createSubgraph(id);
          reference.push(s);
          known.push(s);
          log.push(`create(${id})`);
        } else if (command === 1) {
          const id = pick(ids.filter((x) => x !== undefined)) as string;
          const s = g.subgraph(id);
          if (!reference.includes(s)) reference.push(s);
          if (!known.includes(s)) known.push(s);
          log.push(`subgraph(${id})`);
        } else if (command === 2 && known.length > 0) {
          const s = pick(known);
          g.removeSubgraph(s);
          const i = reference.indexOf(s);
          if (i !== -1) reference.splice(i, 1);
          log.push(`remove(#${known.indexOf(s)})`);
        } else if (command === 3 && known.length > 0) {
          // Adding again: a present one stays where it is, a removed one
          // goes to the end.
          const s = pick(known);
          g.addSubgraph(s);
          if (!reference.includes(s)) reference.push(s);
          log.push(`add(#${known.indexOf(s)})`);
        } else if (command === 4) {
          const s = new Subgraph(pick(ids));
          g.addSubgraph(s);
          reference.push(s);
          known.push(s);
          log.push(`addNew(${s.id})`);
        } else {
          log.push('check');
        }
        const message = `seed ${seed}: ${log.join(' ')}`;
        expect(g.subgraphs, message).toStrictEqual(reference);
        for (const id of ids) {
          if (id === undefined) continue;
          expect(g.getSubgraph(id), message).toBe(
            reference.find((s) => s.id === id),
          );
        }
      }
    }
  });
});

describe('printing random nested graphs', () => {
  function graph(seed: number): string {
    const { int, pick } = random(seed);
    const id = () => pick(['a', 'b', 'c', '"q q"', '1', '-2.5', 'node_1']);
    const attrs = () =>
      int(3) === 0
        ? ''
        : ` [${pick(['label', 'color', 'shape'])}=${pick(['x', '"y z"', '<<b>h</b>>', '2'])}${int(2) ? ', k=v' : ''}]`;
    const comment = () => pick(['/* c */', '// e', '# f', '/*g*/']);
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
