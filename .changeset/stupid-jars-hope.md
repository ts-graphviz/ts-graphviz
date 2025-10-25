---
"@ts-graphviz/ast": patch
"@ts-graphviz/react": patch
---

Clarify security model: GraphViz HTML-like labels vs browser HTML

Add documentation clarifying that HTML-like labels are part of the GraphViz DOT language specification and are not browser HTML. This helps prevent confusion about XSS risks, which occur when rendering GraphViz output in browsers, not when generating DOT strings.