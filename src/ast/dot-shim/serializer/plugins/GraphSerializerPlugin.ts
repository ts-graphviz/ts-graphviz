import { GraphASTNode } from '../../../types.js';
import { SerializerFunction } from '../types.js';

export const GraphSerializerPlugin: SerializerFunction<GraphASTNode> = function* (ast) {
  this.directed = ast.directed;

  if (ast.strict) {
    yield 'strict ';
  }
  yield ast.directed ? 'digraph ' : 'graph ';
  if (ast.id) {
    yield* this.serialize(ast.id);
    yield ' ';
  }
  yield '{';
  if (ast.children.length >= 1) {
    yield* this.serializeChildren(ast.children);
  }
  yield '}';
};
