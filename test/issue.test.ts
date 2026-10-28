import { parse } from '@ts-graphviz/ast';
import { Digraph, fromDot, toDot } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

// issue #1335
describe('HTML-like label handling in AST parser and DOT serializer', () => {
  const src = `digraph g {
   a [label=<<table><tr><td>NOK</td></tr></table>>]
   b [label=<<b>NOK<b>>]
   c [label=<OK>];
}`;

  it('parses each HTML-like label as one html literal holding the markup as written', () => {
    const [graph] = parse(src).children;
    expect(graph).toMatchObject({ type: 'Graph', directed: true });
    if (graph.type !== 'Graph') throw new Error('expected a graph');
    expect(graph.children).toHaveLength(3);
    expect(graph.children).toMatchObject(
      [
        ['a', '<table><tr><td>NOK</td></tr></table>'],
        ['b', '<b>NOK<b>'],
        ['c', 'OK'],
      ].map(([id, markup]) => ({
        type: 'Node',
        id: { kind: 'bare', value: id },
        children: [
          {
            type: 'Attribute',
            key: { value: 'label' },
            value: { type: 'Literal', kind: 'html', value: markup },
          },
        ],
      })),
    );
  });

  it('round-trips through model to valid DOT with proper quoting and node order', () => {
    const model = fromDot(src);
    const dot = toDot(model);
    expect(dot).toMatchInlineSnapshot(`
      "digraph "g" {
        "a" [
          label = <<table><tr><td>NOK</td></tr></table>>;
        ];
        "b" [
          label = <<b>NOK<b>>;
        ];
        "c" [
          label = <OK>;
        ];
      }"
    `);
  });
});

// issue #1563
// The per-call count itself is tested on fromModel
// (packages/ast/src/model-shim/from-model/from-model.test.ts); this case
// checks that toDot passes `convert.maxASTNodes` on and counts per call.
describe('Builder nodeCount accumulation across repeated toDot calls', () => {
  it('limits each toDot call by convert.maxASTNodes, not the calls before it', () => {
    const g = new Digraph();
    for (let j = 0; j < 10; j++) {
      g.createNode(`n${j}`);
    }
    for (let i = 0; i < 50; i++) {
      toDot(g, { convert: { maxASTNodes: 100 } });
    }
    expect(() => toDot(g, { convert: { maxASTNodes: 5 } })).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_AST_NODE_COUNT_EXCEEDED' }),
    );
  });
});

// issue #1620
describe('escaping of NodeRefGroup members', () => {
  it('writes ids and ports of grouped edge targets with the same escaping as direct targets', () => {
    const g = new Digraph();
    g.edge(['a"', [{ id: 'b"', port: 'p\\q' }, 'c']]);
    const dot = toDot(g);
    expect(dot).toMatchInlineSnapshot(`
      "digraph {
        "a\\"" -> "b\\"":"p\\\\q", "c";
      }"
    `);
    const again = fromDot(dot);
    expect(again.edges[0].targets[1]).toMatchObject([
      { id: 'b"', port: 'p\\q' },
      { id: 'c' },
    ]);
    expect(toDot(again)).toBe(dot);
  });
});
