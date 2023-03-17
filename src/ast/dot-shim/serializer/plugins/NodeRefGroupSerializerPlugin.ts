import { NodeRefGroupASTNode } from '../../../types.js';
import { SerializerFunction } from '../types.js';

export const NodeRefGroupSerializerPlugin: SerializerFunction<NodeRefGroupASTNode> = function* (ast) {
  yield '{';
  const iter = ast.children[Symbol.iterator]();
  let next = iter.next();
  while (true) {
    yield* this.serialize(next.value);
    next = iter.next();
    if (!next.done) {
      yield ' ';
    } else {
      break;
    }
  }
  yield '}';
};
