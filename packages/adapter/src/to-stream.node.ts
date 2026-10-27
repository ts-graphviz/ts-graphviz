import { type SpawnOptionsWithoutStdio, spawn } from 'node:child_process';
import { PassThrough } from 'node:stream';
import { createCommandAndArgs } from './create-command-and-args.js';
import type { Layout, Options } from './types.js';

/** How long a command is given to stop after its input could not be written. */
const STOP_GRACE_MS = 1000;

/**
 * Execute the Graphviz dot command and make a Stream of the results.
 */
export async function toStream<T extends Layout>(
  dot: string,
  options?: Options<T>,
): Promise<NodeJS.ReadableStream> {
  const [command, args] = createCommandAndArgs(options ?? {});
  return new Promise(function toStreamInternal(resolve, reject) {
    // Spawn options, and the environment, in objects without a prototype.
    const p = spawn(command, args, {
      __proto__: null,
      stdio: 'pipe',
      shell: false,
      env: ownEnv(),
    } as SpawnOptionsWithoutStdio);

    // Every failure of the command and of its pipes settles the returned
    // promise, once, and is never left unhandled.
    let settled = false;
    const settle = (result: Error | NodeJS.ReadableStream) => {
      if (settled) return;
      settled = true;
      if (result instanceof Error) reject(result);
      else resolve(result);
    };
    // Stopping is attempted once: a failed kill emits 'error' on the
    // process, whose handler must not stop again.
    let stopping = false;
    const stop = () => {
      if (stopping) return;
      stopping = true;
      try {
        p.kill();
      } catch {
        // Already gone, or not killable: there is nothing more to do.
      }
    };
    const failed = (what: string, e: Error) =>
      new Error(
        `Command "${command}" failed.\nMESSAGE: ${what}: ${e.message}`,
        {
          cause: e,
        },
      );

    p.on('error', (e) => {
      // While stopping a failing command, an error from the attempt to stop
      // it is not the result: the exit status, or the timed fallback, is.
      if (stopping) return;
      settle(
        new Error(`Command "${command}" failed.\nMESSAGE:${e.message}`, {
          cause: e,
        }),
      );
      stop();
    });

    const stderrChunks: Uint8Array[] = [];
    p.stderr.on('data', (chunk) => stderrChunks.push(chunk));
    p.stderr.on('pause', () => p.stderr.resume());
    p.stdout.on('pause', () => p.stdout.resume());

    // The output the caller reads. A failure of stdout ends it with the
    // error, which the caller sees as a stream error.
    const dist = new PassThrough();
    dist.on('error', (e) => {
      // Before the result is known, a failure of the output is a failure of
      // the call; after it, the caller sees it on the stream.
      settle(failed('stdout', e));
      stop();
    });
    p.stdout.on('error', (e) => {
      const error = failed('stdout', e);
      settle(error);
      dist.destroy(error);
      stop();
    });
    p.stderr.on('error', (e) => {
      settle(failed('stderr', e));
      stop();
    });
    p.stdout.pipe(dist);

    // The command may stop reading its input (for example on a syntax error),
    // and then writing fails. The failure is kept for the exit status, which
    // decides the result; the command is stopped so that 'close' follows. A
    // command that does not stop is killed, and if even that does not close
    // it, the write failure itself is the result.
    let stdinError: Error | undefined;
    let closed = false;
    let timer: NodeJS.Timeout | undefined;
    p.stdin.on('error', (e) => {
      stdinError = e;
      if (closed) return; // The command is gone; nothing to stop.
      stop();
      timer = setTimeout(() => {
        // The fallback rejection is armed first: a failed SIGKILL may emit
        // 'error' synchronously, and nothing here must run twice.
        timer = setTimeout(() => settle(failed('stdin', e)), STOP_GRACE_MS);
        try {
          p.kill('SIGKILL');
        } catch {
          // Nothing more to do.
        }
      }, STOP_GRACE_MS);
    });
    p.stdin.end(dot);

    p.on('close', (code, signal) => {
      closed = true;
      clearTimeout(timer);
      // An error queued on stdin is delivered before the next turn.
      setImmediate(() => {
        if (code === 0 && stdinError === undefined) {
          settle(dist);
          return;
        }
        const message = Buffer.concat(
          stderrChunks as ReadonlyArray<Uint8Array>,
        ).toString();
        settle(
          new Error(
            `Command "${command}" failed.\nCODE: ${code}\nSIGNAL: ${signal}\nMESSAGE: ${message}`,
            stdinError ? { cause: stdinError } : undefined,
          ),
        );
      });
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
