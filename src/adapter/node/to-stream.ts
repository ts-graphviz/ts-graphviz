import { Readable } from 'node:stream';
import { spawn } from 'node:child_process';
import { Layout, Options } from '../types/index.js';
import { commandBuilder } from '../utils/index.js';
import { pipeline } from './utils.js';

/**
 * Execute the Graphviz dot command and make a Stream of the results.
 */
export async function toStream<T extends Layout>(dot: string, options?: Options<T>): Promise<NodeJS.ReadableStream> {
  const [command, args] = commandBuilder(options ?? {});
  const p = spawn(command, args, { stdio: 'pipe' });
  await pipeline(Readable.from([dot]), p.stdin);
  return p.stdout;
}
