import { NodeRefASTNode } from '../../../types.js';
import { SerializerFunction } from '../types.js';

export const NodeRefSerializerPlugin: SerializerFunction<NodeRefASTNode> = function* (ast) {
  yield* this.serialize(ast.id);
  if (ast.port) {
    yield ':';
    yield* this.serialize(ast.port);
  }
  if (ast.compass) {
    yield ':';
    yield* this.serialize(ast.compass);
  }
};
