import { DotExecutor } from './models/executor.js';
import { Options } from './types.js';

export function toStream(dot: string, options?: Options): Promise<NodeJS.ReadableStream> {
  return new DotExecutor(options).toStream(dot);
}
