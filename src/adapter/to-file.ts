import { Options } from './types.js';
import { DotExecutor } from './models/executor.js';

export function toFile(dot: string, filePath: string, options?: Options): Promise<void> {
  return new DotExecutor(options).toFile(dot, filePath);
}
