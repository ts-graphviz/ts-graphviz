// Type-checked by `pnpm check:consumer-types` (scripts/check-consumer-types.ts)
// only where TypeScript resolves require() of ES modules: the packages are
// ESM-only, which TypeScript >= 5.8 supports with `module: nodenext`.
import tsg = require('ts-graphviz');
import ast = require('ts-graphviz/ast');
import adapter = require('@ts-graphviz/adapter');

const g: tsg.RootGraphModel = tsg.digraph((g) => {
  g.edge(['a', 'b'], { color: 'red' });
});
const text: string = ast.stringify(ast.parse(tsg.toDot(g)));
adapter.toBlob(text, { format: 'svg' });
