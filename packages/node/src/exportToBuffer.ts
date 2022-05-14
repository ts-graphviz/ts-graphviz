import { IRootCluster, toDot } from 'ts-graphviz';
import { ExecuteOption } from './types';
import { executeDot } from './executeDot';

type Option = Omit<ExecuteOption, 'output'>;

/**
 * Returns the Graphviz output result as a buffer.
 */
export async function exportToBuffer(dot: IRootCluster | string, options: Option = {}): Promise<Buffer> {
  const input = typeof dot === 'string' ? dot : toDot(dot);
  return await executeDot(input, options);
}
