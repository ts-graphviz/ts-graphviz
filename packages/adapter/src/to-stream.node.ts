import { spawn } from 'node:child_process';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createCommandAndArgs } from './create-command-and-args.js';
import { CommandExecutionError } from './errors.js';
import { outputLimit, outputLimitExceeded, TailBuffer } from './limits.js';
import type { Layout, Options } from './types.js';

/**
 * Execute the Graphviz dot command and make a Web `ReadableStream` of the
 * results, as on every other runtime.
 *
 * The output is collected while the command runs (at most `maxOutputSize`
 * bytes) and the stream is returned once the command has succeeded, so a
 * failure is always reported by the returned promise.
 *
 * @param dot - The DOT source.
 * @param options - Layout, output format, limits and the other options of the command.
 * @returns The output of the command as a stream of bytes.
 * @throws {CommandExecutionError} when the command cannot be started, fails
 * while reading its input, or exits with a non-zero code.
 * @throws `RangeError` with `code` `TSG_ERR_OUTPUT_LIMIT_EXCEEDED` when the
 * output exceeds `maxOutputSize`.
 * @throws `signal.reason` when `signal` aborts.
 */
export async function toStream<T extends Layout>(
  dot: string,
  options?: Options<T>,
): Promise<ReadableStream<Uint8Array>> {
  const opts: Options<T> = options ?? ({} as Options<T>);
  const [command, args] = createCommandAndArgs(opts);
  const limit = outputLimit(opts);
  const { signal } = opts;
  signal?.throwIfAborted();

  return new Promise(function toStreamInternal(resolve, reject) {
    let settled = false;
    const settle = (action: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', onAbort);
      action();
    };
    const fail = (error: unknown) => settle(() => reject(error));

    let p: ReturnType<typeof spawn>;
    try {
      p = spawn(command, args, { stdio: 'pipe' });
    } catch (e) {
      // e.g. an argument containing a NUL character
      const message = e instanceof Error ? e.message : String(e);
      fail(
        new CommandExecutionError(command, `MESSAGE:${message}`, undefined, {
          cause: e,
        }),
      );
      return;
    }
    const { stdin, stdout, stderr } = p as typeof p & {
      stdin: NonNullable<typeof p.stdin>;
      stdout: NonNullable<typeof p.stdout>;
      stderr: NonNullable<typeof p.stderr>;
    };

    function onAbort() {
      p.kill('SIGKILL');
      fail(signal?.reason);
    }
    signal?.addEventListener('abort', onAbort, { once: true });

    p.on('error', (e) => {
      fail(
        new CommandExecutionError(command, `MESSAGE:${e.message}`, undefined, {
          cause: e,
        }),
      );
    });

    const chunks: Buffer[] = [];
    let size = 0;
    stdout.on('data', (chunk: Buffer) => {
      if (settled) return;
      size += chunk.byteLength;
      if (limit > 0 && size > limit) {
        p.kill('SIGKILL');
        fail(outputLimitExceeded(command, limit));
        return;
      }
      chunks.push(chunk);
    });
    const errors = new TailBuffer();
    stderr.on('data', (chunk: Buffer) => errors.push(chunk));

    // Set when writing the DOT source fails; the process is then killed and
    // the outcome is decided when it has exited.
    let inputError: unknown;

    p.on('close', (code, exitSignal) => {
      const message = errors.toString();
      if (code === 0 && inputError === undefined) {
        settle(() =>
          resolve(
            Readable.toWeb(Readable.from(chunks)) as ReadableStream<Uint8Array>,
          ),
        );
      } else if (code !== 0 && code !== null) {
        // The command failed on its own (e.g. a syntax error closes stdin
        // early); its exit status and stderr explain why.
        fail(
          new CommandExecutionError(
            command,
            `CODE: ${code}\nSIGNAL: ${exitSignal}\nMESSAGE: ${message}`,
            { code, signal: exitSignal, stderr: message },
            inputError === undefined ? undefined : { cause: inputError },
          ),
        );
      } else {
        // Killed (by us after an input failure, or from outside), or the
        // input failed although the command exited cleanly.
        const reason =
          inputError instanceof Error
            ? inputError.message
            : inputError === undefined
              ? `killed by ${exitSignal}`
              : String(inputError);
        fail(
          new CommandExecutionError(
            command,
            `MESSAGE:${reason}`,
            { code, signal: exitSignal, stderr: message },
            inputError === undefined ? undefined : { cause: inputError },
          ),
        );
      }
    });

    // Feeding stdin can fail on its own (e.g. EPIPE when the command exits
    // before reading). Never leave the process running: kill it and report
    // once it has exited, instead of an unhandled rejection.
    pipeline(Readable.from([dot]), stdin).catch((e: unknown) => {
      inputError ??= e;
      p.kill('SIGKILL');
    });

    // After we killed the process for an input failure, settle on 'exit':
    // 'close' also waits for the output pipes, which a leftover child of
    // the command could keep open indefinitely.
    p.on('exit', (code, exitSignal) => {
      if (inputError === undefined || code !== null) return;
      stdout.destroy();
      stderr.destroy();
      const reason =
        inputError instanceof Error ? inputError.message : String(inputError);
      fail(
        new CommandExecutionError(
          command,
          `MESSAGE:${reason}`,
          { code, signal: exitSignal, stderr: errors.toString() },
          { cause: inputError },
        ),
      );
    });
  });
}
