import fc from 'fast-check';
import { digraph, graph as graphOf, toDot } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { PLAYGROUND_MODULES } from './modules';
import { runScript } from './run-script';

const run = (source: string) => runScript(source, PLAYGROUND_MODULES);

describe('runScript', () => {
  it('renders the graph of the last expression', () => {
    const result = run(`
      import { digraph, attribute as _ } from 'ts-graphviz';
      digraph('G', { [_.rankdir]: 'LR' }, (g) => {
        g.edge(['a', 'b'], { [_.label]: 'x' });
      });
    `);
    expect(result).toEqual({
      ok: true,
      dot: toDot(
        digraph('G', { rankdir: 'LR' }, (g) => {
          g.edge(['a', 'b'], { label: 'x' });
        }),
      ),
    });
  });

  it('strips TypeScript syntax', () => {
    const result = run(`
      import { digraph, type NodeModel } from 'ts-graphviz';
      interface Spec { id: string }
      const specs: Spec[] = [{ id: 'a' }, { id: 'b' }];
      const g = digraph('G');
      const nodes: NodeModel[] = specs.map(({ id }) => g.node(id));
      g.edge(nodes as [NodeModel, NodeModel]);
      g satisfies object;
    `);
    expect(result).toMatchObject({ ok: true });
    expect(result.ok && result.dot).toContain('"a" -> "b";');
  });

  it('prefers the default export over the last expression', () => {
    const result = run(`
      import { graph } from 'ts-graphviz';
      export default graph('Exported');
      'digraph Ignored {}';
    `);
    expect(result).toEqual({ ok: true, dot: toDot(graphOf('Exported')) });
  });

  it('passes DOT strings through', () => {
    expect(run(`'digraph { a -> b }'`)).toEqual({
      ok: true,
      dot: 'digraph { a -> b }',
    });
  });

  it('can import ts-graphviz/ast', () => {
    const result = run(`
      import { parse, stringify } from 'ts-graphviz/ast';
      stringify(parse('digraph { a -> b }'));
    `);
    expect(result).toMatchObject({ ok: true });
    expect(result.ok && result.dot).toContain('a -> b');
  });

  it('accepts a namespace import', () => {
    expect(
      run(`import * as t from 'ts-graphviz'; t.toDot(t.graph('N'));`),
    ).toEqual({ ok: true, dot: toDot(graphOf('N')) });
  });

  it.each([
    ["import fs from 'node:fs'; fs;", "Cannot import 'node:fs'"],
    ['const x = ;', 'Unexpected token'],
    ["throw new RangeError('boom');", 'boom'],
    [
      "import { digraph } from 'ts-graphviz'; const g = digraph('G');",
      'did not produce a graph',
    ],
    ['', 'did not produce a graph'],
    ['42;', 'produced a number, not a graph'],
    ['[];', 'produced an array, not a graph'],
    ['null;', 'produced null, not a graph'],
    [
      "import { node } from 'ts-graphviz'; ({});",
      'produced an object, not a graph',
    ],
  ])('reports a failure for %j', (source, message) => {
    const result = run(source);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error.message).toContain(message);
  });

  it('keeps the error name', () => {
    expect(run("throw new RangeError('boom');")).toEqual({
      ok: false,
      error: { name: 'RangeError', message: 'boom' },
    });
  });

  it('reports thrown non-errors', () => {
    expect(run("throw 'plain';")).toEqual({
      ok: false,
      error: { name: 'Error', message: 'plain' },
    });
  });

  it('runs scripts in strict mode', () => {
    expect(run('undeclared = 1;')).toMatchObject({
      ok: false,
      error: { name: 'ReferenceError' },
    });
  });

  it('does not leak variables between runs', () => {
    expect(run("var leaked = 'digraph {}'; leaked;")).toMatchObject({
      ok: true,
    });
    expect(run('typeof leaked;')).toEqual({ ok: true, dot: 'undefined' });
    expect('leaked' in globalThis).toBe(false);
  });

  // A script built from model calls renders the same DOT as making the same
  // calls directly: the transpile/evaluate path adds or loses nothing.
  it('matches building the graph directly', () => {
    const id = fc.stringMatching(/^[A-Za-z_][A-Za-z0-9_]{0,6}$/);
    const edges = fc.array(fc.tuple(id, id), { maxLength: 8 });
    fc.assert(
      fc.property(fc.boolean(), id, edges, (directed, name, pairs) => {
        const factory = directed ? 'digraph' : 'graph';
        const body = pairs
          .map(
            ([a, b]) => `g.edge([${JSON.stringify(a)}, ${JSON.stringify(b)}]);`,
          )
          .join('\n');
        const source = `import { ${factory} } from 'ts-graphviz';\n${factory}(${JSON.stringify(name)}, (g) => {\n${body}\n});`;
        const expected = toDot(
          (directed ? digraph : graphOf)(name, (g) => {
            for (const [a, b] of pairs) g.edge([a, b]);
          }),
        );
        expect(run(source)).toEqual({ ok: true, dot: expected });
      }),
    );
  });
});
