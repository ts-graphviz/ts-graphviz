import { AttributeListASTNode } from '../../../types.js';
import { SerializerFunction } from '../types.js';

export const DefaultAttributeListSerializer: SerializerFunction<AttributeListASTNode> = function* (ast) {
  yield ast.kind.toLocaleLowerCase();
  yield ' [';
  if (ast.children.length >= 1) {
    yield* this.serializeChildren(ast.children);
  }
  yield '];';
};
