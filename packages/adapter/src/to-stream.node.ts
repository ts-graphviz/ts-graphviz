import { spawn } from 'node:child_process';
import { PassThrough, Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createCommandAndArgs } from './create-command-and-args.js';
import { CommandExecutionError } from './errors.js';
import type { Layout, Options } from './types.js';

/**
 * Execute the Graphviz dot command and make a Web `ReadableStream` of the
 * results, as on every other runtime.
 *
 * @param dot - The DOT source.
 * @param options - Layout, output format and the other options of the command.
 * @returns The output of the command as a stream of bytes.
 * @throws {CommandExecutionError} when the command cannot be started or exits
 * with a non-zero code.
 */
export async function toStream<T extends Layout>(
  dot: string,
  options?: Options<T>,
): Promise<ReadableStream<Uint8Array>> {
  const [command, args] = createCommandAndArgs(options ?? {});
  return new Promise(function toStreamInternal(resolve, reject) {
    const p = spawn(command, args, { stdio: 'pipe' });

    // error handling
    p.on('error', (e) => {
      reject(
        new CommandExecutionError(command, `MESSAGE:${e.message}`, undefined, {
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
        resolve(Readable.toWeb(dist) as ReadableStream<Uint8Array>);
      } else {
        const stderr = Buffer.concat(
          stderrChunks as ReadonlyArray<Uint8Array>,
        ).toString();
        reject(
          new CommandExecutionError(
            command,
            `CODE: ${code}\nSIGNAL: ${signal}\nMESSAGE: ${stderr}`,
            { code, signal, stderr },
          ),
        );
      }
    });

    // Feeding stdin can fail on its own (e.g. EPIPE when the command exits
    // before reading); report it like any other command failure instead of
    // leaving an unhandled rejection.
    pipeline(Readable.from([dot]), p.stdin).catch((e: unknown) => {
      const message = e instanceof Error ? e.message : String(e);
      reject(
        new CommandExecutionError(command, `MESSAGE:${message}`, undefined, {
          cause: e,
        }),
      );
    });
  });
}
