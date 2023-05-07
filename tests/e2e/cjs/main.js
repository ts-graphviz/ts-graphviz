'use strict';
const gv = require('ts-graphviz');
const ast = require('@ts-graphviz/ast');
const adapter = require('@ts-graphviz/adapter');
const G = new gv.Digraph();
const A = new gv.Subgraph('A');
const node1 = new gv.Node('node1', {
  [gv.attribute.color]: 'red',
});
const node2 = new gv.Node('node2', {
  [gv.attribute.color]: 'blue',
});
const edge = new gv.Edge([node1, node2], {
  [gv.attribute.label]: 'Edge Label',
  [gv.attribute.color]: 'pink',
});
G.addSubgraph(A);
A.addNode(node1);
A.addNode(node2);
A.addEdge(edge);
const dot = gv.toDot(G);
ast.parse(dot);
(async () => {
  try {
    await (0, adapter.toFile)(dot, '/dev/null');
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
    }
  }
})();
