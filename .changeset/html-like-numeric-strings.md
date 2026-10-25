---
"@ts-graphviz/common": minor
"@ts-graphviz/react": patch
---

Numeric attributes of HTML-like labels (`border`, `cellborder`, `cellpadding`, `width`, `point-size`, …) accept numeric strings as well (`border="1"`), as HTML attributes are written and as the `@ts-graphviz/react` README shows. The README's edge-target example narrows a target before reading its `id`.
