import { ASTNodeCountExceededError, parse } from '@ts-graphviz/ast';
import { Digraph, fromDot, toDot } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

// issue #1335
describe('HTML-like label handling in AST parser and DOT serializer', () => {
  const src = `digraph g {
   a [label=<<table><tr><td>NOK</td></tr></table>>]
   b [label=<<b>NOK<b>>]
   c [label=<OK>];
}`;

  it('parses HTML-like label literals into correct AST structure', () => {
    const ast = parse(src);
    expect(ast).toMatchSnapshot();
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
describe('Builder nodeCount accumulation across repeated toDot calls', () => {
  it('should not throw when toDot is called 200+ times in sequence', () => {
    for (let i = 0; i < 250; i++) {
      const g = new Digraph();
      g.createNode(`node_${i}`);
      toDot(g);
    }
  });

  it('should respect maxASTNodes option via toDot convert options', () => {
    const g = new Digraph();
    for (let j = 0; j < 10; j++) {
      g.createNode(`n${j}`);
    }

    // Very small limit should trigger error
    expect(() => toDot(g, { convert: { maxASTNodes: 5 } })).toThrow(
      ASTNodeCountExceededError,
    );

    // Large limit should work fine
    expect(() => toDot(g, { convert: { maxASTNodes: 10000 } })).not.toThrow();
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
