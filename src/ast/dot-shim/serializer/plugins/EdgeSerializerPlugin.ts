import { EdgeASTNode } from '../../../types.js';
import { SerializerFunction } from '../types.js';

export const EdgeSerializerPlugin: SerializerFunction<EdgeASTNode> = function* (ast) {
  const edgeOperator = this.directed ? ' -> ' : ' -- ';
  const targetIter = ast.targets[Symbol.iterator]();
  let next = targetIter.next();
  while (true) {
    yield* this.serialize(next.value);
    next = targetIter.next();
    if (!next.done) {
      yield edgeOperator;
    } else {
      break;
    }
  }

  if (ast.children.length === 0) {
    yield ';';
    return;
  }
  yield ' [';
  if (ast.children.length >= 1) {
    yield* this.serializeChildren(ast.children);
  }
  yield '];';
};
