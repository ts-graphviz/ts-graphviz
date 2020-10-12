import { IRootCluster, toDot } from 'ts-graphviz';
import { Format } from './types';
import { executeDot } from './executeDot';

/**
 * Returns the Graphviz output result as a buffer.
 */
export async function exportToBuffer(dot: IRootCluster | string, options: { format?: Format } = {}): Promise<Buffer> {
  const input = typeof dot === 'string' ? dot : toDot(dot);
  return await executeDot(input, options);
}
