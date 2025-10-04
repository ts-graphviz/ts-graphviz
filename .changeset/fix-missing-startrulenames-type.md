---
"@ts-graphviz/ast": patch
---

Fix TypeScript compilation error when skipLibCheck is false

This fixes issue #1478 where importing from `ts-graphviz` would cause a TypeScript error:
"Cannot find module './_parse.js' or its corresponding type declarations."

The issue was caused by the `Rule` type referencing `StartRuleNames` from the auto-generated
`_parse.ts` file, which was not properly exported. The fix removes the dependency on the
generated type and defines the `Rule` type directly in `parse.ts`.

Changes:
- Remove import of non-existent `StartRuleNames` type from `_parse.ts`
- Fix import of `PeggySyntaxError` to use the correct export name
- Define `Rule` type directly as a union of rule name string literals
