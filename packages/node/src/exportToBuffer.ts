import { Graph, toDot } from 'ts-graphviz';
import { ExecuteOption } from './types.js';
import { executeDot } from './executeDot.js';

type Option = Omit<ExecuteOption, 'output'>;

/**
 * Returns the Graphviz output result as a buffer.
 */
export function exportToBuffer(dot: Graph | string, options: Option = {}): Promise<Buffer> {
  const input = typeof dot === 'string' ? dot : toDot(dot);
  return executeDot(input, options);
}
