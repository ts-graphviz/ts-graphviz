import { type SpawnOptionsWithoutStdio, spawn } from 'node:child_process';
import { createCommandAndArgs } from './create-command-and-args.js';
import { CommandExecutionError } from './errors.js';
import { outputLimit, outputLimitExceeded, TailBuffer } from './limits.js';
import { ownAdapterOptions } from './options.js';
import { sourceToRender } from './source.js';
import type { Layout, Options } from './types.js';

/** How long a killed process is given to exit after its input failed. */
const KILL_GRACE_MS = 1000;

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
 * @throws `DOMException` named `SecurityError` (`code` `TSG_ERR_UNSAFE_DOT`)
 * or `DotSyntaxError` when `sanitize` (on by default) rejects the source.
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
  const opts = ownAdapterOptions(options);
  const [command, args] = createCommandAndArgs(opts);
  const limit = outputLimit(opts);
  const { signal } = opts;
  signal?.throwIfAborted();
  const source = sourceToRender(dot, opts);

  return new Promise(function toStreamInternal(resolve, reject) {
    let settled = false;
    let release = () => {};
    let timer: NodeJS.Timeout | undefined;
    const settle = (action: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      action();
    };
    // Every failure kills the process and lets go of its pipes: a leftover
    // child of the command could otherwise keep them (and this call's
    // resources) alive.
    const fail = (error: unknown) => {
      settle(() => reject(error));
      release();
    };

    let p: ReturnType<typeof spawn>;
    try {
      // Spawn options, and the environment, in objects without a prototype:
      // spawn copies inherited enumerable keys into the child's environment,
      // and some Node.js releases read an inherited `shell`.
      p = spawn(command, args, {
        __proto__: null,
        stdio: 'pipe',
        shell: false,
        env: ownEnv(),
      } as SpawnOptionsWithoutStdio);
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
    // Killed once: a failed kill() emits 'error' on the process at once,
    // and the handler must not kill (and fail) again.
    let killed = false;
    const kill = () => {
      if (killed) return;
      killed = true;
      try {
        p.kill('SIGKILL');
      } catch {
        // Nothing more can be done; the call still settles.
      }
    };
    release = () => {
      kill();
      stdin.destroy();
      stdout.destroy();
      stderr.destroy();
    };

    function onAbort() {
      fail(signal?.reason);
    }
    signal?.addEventListener('abort', onAbort, { once: true });

    p.on('error', (e) => {
      // Once killed, an error is from the kill: the exit status, or the
      // input failure after KILL_GRACE_MS, explains the failure better.
      if (killed) return;
      fail(
        new CommandExecutionError(command, `MESSAGE:${e.message}`, undefined, {
          cause: e,
        }),
      );
    });

    const chunks: Buffer[] = [];
    let size = 0;
    // Node.js creates these pipes with options of its own that inherit from
    // Object.prototype, so an inherited `encoding` would turn the output
    // into text. Read it as latin1, which maps each byte to one character,
    // and turn it back into the same bytes.
    stdout.setEncoding('latin1');
    stderr.setEncoding('latin1');
    stdout.on('data', (text: string) => {
      const chunk = Buffer.from(text, 'latin1');
      if (settled) return;
      size += chunk.byteLength;
      if (limit > 0 && size > limit) {
        fail(outputLimitExceeded(command, limit));
        return;
      }
      chunks.push(chunk);
    });
    const errors = new TailBuffer();
    stderr.on('data', (text: string) =>
      errors.push(Buffer.from(text, 'latin1')),
    );
    // Let go of each output pipe once it has ended: with an inherited
    // `allowHalfOpen`, Node.js keeps an ended pipe open, and the process
    // would never report 'close'.
    stdout.on('end', () => stdout.destroy());
    stderr.on('end', () => stderr.destroy());
    // A read error on an output pipe: report it as the call's failure.
    // Without a listener, the 'error' event would be thrown out of the
    // stream and end the process instead.
    const onOutputError = (e: unknown) => {
      const message = e instanceof Error ? e.message : String(e);
      fail(
        new CommandExecutionError(command, `MESSAGE:${message}`, undefined, {
          cause: e,
        }),
      );
    };
    stdout.on('error', onOutputError);
    stderr.on('error', onOutputError);

    // Set when writing the DOT source fails.
    let inputError: unknown;
    // Set on 'exit': the process is gone, its pipes may still be open.
    let exited:
      | { code: number | null; signal: NodeJS.Signals | null }
      | undefined;

    /** Settle from the exit status, once the process is gone. */
    function report(code: number | null, exitSignal: NodeJS.Signals | null) {
      const message = errors.toString();
      const exit = { code, signal: exitSignal, stderr: message };
      const cause =
        inputError === undefined ? undefined : { cause: inputError };
      if (code === 0 && inputError === undefined) {
        settle(() =>
          resolve(
            // A source without a prototype, and no Node.js stream in
            // between: Node.js copies a stream's options into a plain
            // object, so an inherited `encoding` or `signal` would apply.
            new ReadableStream<Uint8Array>({
              __proto__: null,
              start(controller) {
                for (const chunk of chunks) {
                  controller.enqueue(chunk as Uint8Array<ArrayBuffer>);
                }
                controller.close();
              },
            } as ConstructorParameters<typeof ReadableStream<Uint8Array>>[0]),
          ),
        );
      } else if (code !== 0 && code !== null) {
        // The command failed on its own (e.g. a syntax error closes stdin
        // early); its exit status and stderr explain why.
        fail(
          new CommandExecutionError(
            command,
            `CODE: ${code}\nSIGNAL: ${exitSignal}\nMESSAGE: ${message}`,
            exit,
            cause,
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
          new CommandExecutionError(command, `MESSAGE:${reason}`, exit, cause),
        );
      }
    }

    // Normally the outcome is decided on 'close', after all output is read.
    p.on('close', (code, exitSignal) => report(code, exitSignal));
    // After an input failure, decide on 'exit' instead: the output is not
    // needed, and 'close' waits for pipes a leftover child may hold.
    p.on('exit', (code, exitSignal) => {
      exited = { code, signal: exitSignal };
      if (inputError !== undefined) report(code, exitSignal);
    });

    // Feeding stdin can fail on its own (e.g. EPIPE when the command exits
    // before reading). Never leave the process running and never leave the
    // call pending: kill it, and report as soon as it has exited (it may
    // already have). If it has not exited in time (the kill failed, or
    // 'exit' never comes), the input failure is the result.
    const onInputError = (e: unknown) => {
      // Already settled (Node.js destroys stdin on exit, so the error can
      // arrive after 'close'): nothing more to do.
      if (settled || inputError !== undefined) return;
      inputError = e;
      kill();
      if (exited) return report(exited.code, exited.signal);
      timer = setTimeout(() => {
        // Still no exit status: the input failure is all there is.
        const message = e instanceof Error ? e.message : String(e);
        fail(
          new CommandExecutionError(command, `MESSAGE:${message}`, undefined, {
            cause: e,
          }),
        );
      }, KILL_GRACE_MS);
    };
    stdin.on('error', onInputError);
    // Closed before all of the source was written (Node.js destroys stdin
    // when the process exits), possibly without an error.
    let written = false;
    stdin.on('close', () => {
      if (written) return;
      // Node.js's own code for this, as `pipeline` reported it.
      onInputError(
        Object.assign(new Error('Premature close'), {
          code: 'ERR_STREAM_PREMATURE_CLOSE',
        }),
      );
    });
    // Bytes, so that no encoding is looked up for a string. Destroyed once
    // written: with an inherited `allowHalfOpen` the pipe would otherwise
    // stay open, and the process never reports 'close'.
    stdin.end(Buffer.from(source, 'utf8'), (e?: Error | null) => {
      if (e) return onInputError(e);
      written = true;
      stdin.destroy();
    });
  });
}

/**
 * The environment variables the process owns, in an object without a
 * prototype.
 */
function ownEnv(): NodeJS.ProcessEnv {
  const env = Object.create(null) as NodeJS.ProcessEnv;
  for (const key of Object.keys(process.env)) {
    env[key] = process.env[key];
  }
  return env;
}
