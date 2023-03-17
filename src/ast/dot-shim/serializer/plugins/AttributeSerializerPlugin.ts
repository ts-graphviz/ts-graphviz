import { AttributeASTNode } from '../../../types.js';
import { SerializerFunction } from '../types.js';

export const DefaultAttributeSerializer: SerializerFunction<AttributeASTNode> = function* (ast) {
  yield* this.serialize(ast.key);
  yield ' = ';
  yield* this.serialize(ast.value);
  yield ';';
};
