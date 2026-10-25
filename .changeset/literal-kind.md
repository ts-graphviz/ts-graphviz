---
"@ts-graphviz/ast": major
"ts-graphviz": major
---

`Literal` AST nodes say which kind of DOT ID they are with `kind: 'bare' | 'quoted' | 'html'` (`LiteralKind`) instead of `quoted: boolean | 'html'`

Replace `quoted: false` with `kind: 'bare'`, `quoted: true` with `kind: 'quoted'` and `quoted: 'html'` with `kind: 'html'`, in `createElement('Literal', …)` calls and in code that reads parsed ASTs. The old field mixed how a string is written (bare or quoted, the same string to Graphviz) with what it is (an HTML-like value), and `if (literal.quoted)` was true for HTML strings as well.
