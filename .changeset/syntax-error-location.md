---
"@ts-graphviz/ast": minor
"ts-graphviz": minor
---

`DotSyntaxError` has its own `location` (`{ start, end }`; `undefined` for an input over `maxInputSize`). Its `code` and `location` are the contract; the message text and `cause` (the parser's internal error) may change in any release.
