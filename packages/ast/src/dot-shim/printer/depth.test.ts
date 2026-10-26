import { describe, expect, it } from 'vitest';
import type { ASTNode, GraphASTNode } from '../../types.js';
import { parse } from '../parser/parse.js';
import { stringify } from './stringify.js';

const nested = (depth: number) =>
  `digraph { ${'subgraph { a; '.repeat(depth)}${'}'.repeat(depth)} }`;

describe('[SM-2] printing nested graphs', () => {
  it('takes time linear in the output at any depth', () => {
    // 5.3 s at depth 400 when every token went through one generator per level.
    const ast = parse(nested(400), { maxNestingDepth: 401 });
    const start = performance.now();
    stringify(ast);
    expect(performance.now() - start).toBeLessThan(1000);
  });

  it('prints an AST deeper than the call stack', () => {
    // A RangeError (stack overflow) at depth 800 before.
    let inner: ASTNode = {
      type: 'Node',
      id: { type: 'Literal', value: 'a', kind: 'bare' },
      children: [],
    } as unknown as ASTNode;
    const depth = 5000;
    for (let i = 0; i < depth; i++) {
      inner = { type: 'Subgraph', children: [inner] } as unknown as ASTNode;
    }
    const graph = {
      type: 'Graph',
      directed: true,
      strict: false,
      children: [inner],
    } as unknown as GraphASTNode;
    const dot = stringify(
      { type: 'Dot', children: [graph] } as unknown as ASTNode,
      { indentStyle: 'tab' },
    );
    expect(dot.match(/subgraph \{/g)).toHaveLength(depth);
    expect(dot).toContain(`\n${'\t'.repeat(depth + 1)}a;\n`);
  });

  it('indents as before', () => {
    expect(
      stringify(parse('digraph { subgraph { a; subgraph { b } } c }')),
    ).toMatchInlineSnapshot(`
        "digraph {
          subgraph {
            a;
            subgraph {
              b;
            }
          }
          c;
        }"
      `);
  });
});
