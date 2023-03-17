import { LiteralASTNode } from '../../../types.js';
import { SerializerFunction } from '../types.js';

const escape = (value: string): string => value.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/"/g, '\\"');

export const LiteralSerializerPlugin: SerializerFunction<LiteralASTNode> = function* (ast) {
  switch (ast.quoted) {
    case 'html':
      yield '<';
      yield ast.value;
      yield '>';
      return;
    case true:
      yield '"';
      yield escape(ast.value);
      yield '"';
      return;
    case false:
    default:
      yield escape(ast.value);
      return;
  }
};
