import type { RunRequest, RunResponse, RunResult } from './protocol';

/** The part of `Worker` the runner uses; tests pass a fake. */
export interface WorkerLike {
  onmessage: ((event: MessageEvent<RunResponse>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  postMessage(message: RunRequest): void;
  terminate(): void;
}

export interface ScriptRunnerOptions {
  /** Creates the worker that runs scripts (see `worker.ts`). */
  createWorker: () => WorkerLike;
  /** How long a script may run before its worker is terminated. */
  timeoutMs?: number;
}

export const DEFAULT_TIMEOUT_MS = 5000;

interface Pending {
  resolve: (result: RunResult) => void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * Runs Playground scripts in a worker.
 *
 * A worker is created on the first run and reused. A script that runs past
 * the timeout, or a worker that fails, takes the worker down with it: every
 * pending run resolves with an error and the next run starts a new worker.
 * `run` never rejects.
 */
export class ScriptRunner {
  readonly #createWorker: () => WorkerLike;
  readonly #timeoutMs: number;
  readonly #pending = new Map<number, Pending>();
  #worker: WorkerLike | null = null;
  #nextId = 0;
  #disposed = false;

  constructor({
    createWorker,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  }: ScriptRunnerOptions) {
    this.#createWorker = createWorker;
    this.#timeoutMs = timeoutMs;
  }

  run(source: string): Promise<RunResult> {
    if (this.#disposed) {
      return Promise.resolve(
        failure('Error', 'The script runner was disposed.'),
      );
    }
    const id = this.#nextId++;
    return new Promise<RunResult>((resolve) => {
      const timer = setTimeout(() => {
        this.#reset(
          failure(
            'TimeoutError',
            `The script did not finish within ${this.#timeoutMs / 1000} seconds and was stopped.`,
          ),
        );
      }, this.#timeoutMs);
      this.#pending.set(id, { resolve, timer });
      try {
        this.#ensureWorker().postMessage({ id, source });
      } catch (error) {
        this.#reset(
          failure('Error', `Could not start the script: ${String(error)}`),
        );
      }
    });
  }

  /** Stop the worker; pending and later runs resolve with an error. */
  dispose(): void {
    this.#disposed = true;
    this.#reset(failure('Error', 'The script runner was disposed.'));
  }

  #ensureWorker(): WorkerLike {
    if (this.#worker === null) {
      const worker = this.#createWorker();
      worker.onmessage = ({ data }) => {
        const pending = this.#pending.get(data.id);
        if (pending === undefined) return;
        this.#pending.delete(data.id);
        clearTimeout(pending.timer);
        const { id: _, ...result } = data;
        pending.resolve(result);
      };
      worker.onerror = (event) => {
        event.preventDefault?.();
        this.#reset(
          failure(
            'Error',
            `The script worker failed: ${event.message || 'unknown error'}`,
          ),
        );
      };
      this.#worker = worker;
    }
    return this.#worker;
  }

  #reset(result: RunResult): void {
    this.#worker?.terminate();
    this.#worker = null;
    for (const { resolve, timer } of this.#pending.values()) {
      clearTimeout(timer);
      resolve(result);
    }
    this.#pending.clear();
  }
}

function failure(name: string, message: string): RunResult {
  return { ok: false, error: { name, message } };
}
