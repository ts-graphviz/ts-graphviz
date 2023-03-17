import { NodeASTNode } from '../../../types.js';
import { SerializerFunction } from '../types.js';

export const NodeSerializerPlugin: SerializerFunction<NodeASTNode> = function* (ast) {
  yield* this.serialize(ast.id);
  if (ast.children.length >= 1) {
    yield ' [';
    yield* this.serializeChildren(ast.children);
    yield ']';
  }
  yield ';';
};
