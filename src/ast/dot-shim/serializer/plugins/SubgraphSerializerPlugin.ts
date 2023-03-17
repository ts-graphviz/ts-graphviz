import { SubgraphASTNode } from '../../../types.js';
import { SerializerFunction } from '../types.js';

export const SubgraphSerializerPlugin: SerializerFunction<SubgraphASTNode> = function* (ast) {
  yield 'subgraph';
  if (ast.id) {
    yield ' ';
    yield* this.serialize(ast.id);
  }
  yield ' {';
  if (ast.children.length >= 1) {
    yield* this.serializeChildren(ast.children);
  }
  yield '}';
};
