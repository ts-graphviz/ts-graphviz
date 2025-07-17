import { parse } from '@ts-graphviz/ast';
import { fromDot, toDot } from 'ts-graphviz';
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
