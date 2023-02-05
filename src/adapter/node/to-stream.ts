import { Readable, PassThrough } from 'node:stream';
import { spawn } from 'node:child_process';
import { Layout, Options } from '../types/index.js';
import { commandBuilder } from '../utils/index.js';
import { pipeline } from './utils.js';

/**
 * Execute the Graphviz dot command and make a Stream of the results.
 */
export async function toStream<T extends Layout>(dot: string, options?: Options<T>): Promise<NodeJS.ReadableStream> {
  const [command, args] = commandBuilder(options ?? {});
  return new Promise(async function toStreamInternal(resolve, reject) {
    const p = spawn(command, args, { stdio: 'pipe' });

    // error handling
    p.on('error', (e) => {
      reject(
        new Error(`Command "${command}" failed.\nMESSAGE:${e.message}`, {
          cause: e,
        }),
      );
    });

    const stderrChunks: Uint8Array[] = [];
    p.stdout.on('pause', () => p.stdout.resume());
    p.stderr.on('data', (chunk) => stderrChunks.push(chunk));
    p.stderr.on('pause', () => p.stderr.resume());

    const dist = p.stdout.pipe(new PassThrough());
    p.on('close', async (code, signal) => {
      if (code === 0) {
        resolve(dist);
      } else {
        const message = Buffer.concat(stderrChunks as ReadonlyArray<Uint8Array>).toString();
        reject(new Error(`Command "${command}" failed.\nCODE: ${code}\nSIGNAL: ${signal}\nMESSAGE: ${message}`));
      }
    });

    await pipeline(Readable.from([dot]), p.stdin);
  });
}
