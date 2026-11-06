import {
  attribute as _,
  Digraph,
  Edge,
  Node,
  Subgraph,
  toDot,
} from 'ts-graphviz';
import { toBlob } from 'ts-graphviz/adapter';
import { parse } from 'ts-graphviz/ast';

const G = new Digraph();
const A = new Subgraph('A');
const node1 = new Node('node1', {
  [_.color]: 'red',
});
const node2 = new Node('node2', {
  [_.color]: 'blue',
});
const edge = new Edge([node1, node2], {
  [_.label]: 'Edge Label',
  [_.color]: 'pink',
});
G.addSubgraph(A);
A.addNode(node1);
A.addNode(node2);
A.addEdge(edge);
const dot = toDot(G);

parse(dot);

const svg = await (await toBlob(dot)).text();
if (!svg.includes('<svg')) throw new Error('toBlob did not render SVG');
