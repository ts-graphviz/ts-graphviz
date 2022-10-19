import { DotExecutor } from './models/executor.js';
import { Options } from './types.js';

export function toBuffer(dot: string, options?: Options) {
  return new DotExecutor(options).toBuffer(dot);
}
