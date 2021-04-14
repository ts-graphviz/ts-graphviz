import { parse as _parse, SyntaxError } from './grammar/dot.pegjs';
import { Graph } from './types';

/**
 * @throws {SyntaxError}
 */
export const parse: (dot: string) => Graph = _parse;

export { SyntaxError };
