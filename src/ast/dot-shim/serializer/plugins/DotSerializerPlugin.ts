import { DotASTNode } from '../../../types.js';
import { EOL, SerializerFunction } from '../types.js';

export const DefaultDotSerializer: SerializerFunction<DotASTNode> = function* (ast) {
  const tokenIter = ast.children[Symbol.iterator]();
  let next = tokenIter.next();
  while (true) {
    yield* this.serialize(next.value);
    next = tokenIter.next();
    if (next.done) {
      break;
    }
    yield EOL;
  }
};
