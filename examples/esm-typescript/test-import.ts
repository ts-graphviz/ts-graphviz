// TypeScript ESM project testing ts-graphviz imports
import {
  attribute as _,
  Digraph,
  Edge,
  type EdgeAttributesObject,
  Node,
  type NodeAttributesObject,
  Subgraph,
  toDot,
} from 'ts-graphviz';
import { toFile } from 'ts-graphviz/adapter';
import { type ASTNode, parse } from 'ts-graphviz/ast';

console.log('Testing ts-graphviz import from TypeScript ESM project...\n');

// Test 1: Type checking with attributes
console.log('Test 1: Creating typed graph with attributes');
const graph = new Digraph('G', {
  comment: 'TypeScript ESM test graph',
  [_.rankdir]: 'LR',
  [_.bgcolor]: 'lightgray',
});

// Test node creation with typed attributes
const nodeAttrs: NodeAttributesObject = {
  [_.label]: 'TypeScript Node',
  [_.shape]: 'box',
  [_.color]: 'blue',
  [_.fontsize]: 14,
};
const node1 = new Node('node1', nodeAttrs);

// Test edge creation with typed attributes
const edgeAttrs: EdgeAttributesObject = {
  [_.label]: 'Typed Edge',
  [_.color]: 'red',
  [_.style]: 'dashed',
  [_.weight]: 2,
};
const node2 = new Node('node2', { [_.label]: 'Node 2' });
const edge = new Edge([node1, node2], edgeAttrs);

// Test subgraph
const subgraph = new Subgraph('cluster_0', {
  [_.label]: 'Subgraph',
  [_.style]: 'filled',
  [_.fillcolor]: 'lightyellow',
});

subgraph.addNode(node1);
subgraph.addNode(node2);
subgraph.addEdge(edge);
graph.addSubgraph(subgraph);

const dot = toDot(graph);
console.log('✅ Generated DOT with full type checking:', dot);

// Test 2: Parse and type checking
console.log('\nTest 2: Parsing DOT with type safety');
const ast: ASTNode = parse(dot);
console.log('✅ Parsed AST type:', ast.type);

// Test 3: Adapter functionality with async/await
console.log('\nTest 3: Testing adapter with TypeScript');
try {
  await toFile(dot, '/dev/null');
  console.log('✅ Successfully wrote to file using adapter');
} catch (error) {
  console.error('❌ Error writing file:', error);
  process.exit(1);
}

// Test 4: Advanced TypeScript features
console.log('\nTest 4: Testing generic types and advanced features');

// Custom attribute function with generics
function createNodeWithAttrs(id: string, attrs: NodeAttributesObject): Node {
  return new Node(id, attrs);
}

const typedNode = createNodeWithAttrs('typed', {
  [_.label]: 'Generic Node',
  [_.shape]: 'ellipse',
});
graph.addNode(typedNode);

// Test graph traversal with type guards
const nodes = Array.from(graph.nodes);
const edges = Array.from(graph.edges);
const subgraphs = Array.from(graph.subgraphs);

console.log(
  `✅ Graph contains: ${nodes.length} nodes, ${edges.length} edges, ${subgraphs.length} subgraphs`,
);

// Test 5: All tests completed
console.log('\nTest 5: Testing completed successfully');

console.log('\n🎉 All TypeScript ESM tests passed with full type safety!');
