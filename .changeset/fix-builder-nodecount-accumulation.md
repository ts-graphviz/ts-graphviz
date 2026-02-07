---
"@ts-graphviz/ast": patch
"ts-graphviz": patch
---

fix: prevent Builder nodeCount accumulation across repeated fromModel/toDot calls

Added `createElementFactory()` to create fresh Builder instances per conversion, fixing an issue where the singleton Builder's nodeCount accumulated across calls and eventually threw `ASTNodeCountExceededError`. Also added `maxASTNodes` option to `ConvertFromModelOptions` for user-configurable AST node limits in the fromModel/toDot path.
