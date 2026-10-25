import type { Engine } from '@hpcc-js/wasm-graphviz';
import type {
  LayoutResult,
  RunError,
  RunResult,
  WorkerRequest,
  WorkerResponse,
} from './protocol';

/** The part of `Worker` the runner uses; tests pass a fake. */
export interface WorkerLike {
  onmessage: ((event: MessageEvent<WorkerResponse>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  postMessage(message: WorkerRequest): void;
  terminate(): void;
}

export interface ScriptRunnerOptions {
  /** Creates the worker that runs scripts and layouts (see `worker.ts`). */
  createWorker: () => WorkerLike;
  /** How long a script may run before its worker is terminated. */
  timeoutMs?: number;
  /** How long a layout may take (the first one also loads Graphviz). */
  layoutTimeoutMs?: number;
}

export const DEFAULT_TIMEOUT_MS = 5000;
export const DEFAULT_LAYOUT_TIMEOUT_MS = 15000;

type Request =
  | { type: 'run'; source: string }
  | { type: 'layout'; dot: string; engine: Engine };

interface Pending {
  resolve: (result: { ok: false; error: RunError } | WorkerResponse) => void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * Runs Playground scripts and Graphviz layouts in a worker.
 *
 * A worker is created on the first request and reused. A request that runs
 * past its timeout, or a worker that fails, takes the worker down with it:
 * every pending request resolves with an error and the next request starts
 * a new worker. `run` and `layout` never reject.
 */
export class ScriptRunner {
  readonly #createWorker: () => WorkerLike;
  readonly #timeoutMs: number;
  readonly #layoutTimeoutMs: number;
  readonly #pending = new Map<number, Pending>();
  #worker: WorkerLike | null = null;
  #nextId = 0;
  #disposed = false;

  constructor({
    createWorker,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    layoutTimeoutMs = DEFAULT_LAYOUT_TIMEOUT_MS,
  }: ScriptRunnerOptions) {
    this.#createWorker = createWorker;
    this.#timeoutMs = timeoutMs;
    this.#layoutTimeoutMs = layoutTimeoutMs;
  }

  /** Run a script and get the DOT it produced. */
  run(source: string): Promise<RunResult> {
    return this.#request(
      { type: 'run', source },
      this.#timeoutMs,
      'The script',
    ) as Promise<RunResult>;
  }

  /** Lay out DOT with Graphviz and get the SVG. */
  layout(dot: string, engine: Engine): Promise<LayoutResult> {
    return this.#request(
      { type: 'layout', dot, engine },
      this.#layoutTimeoutMs,
      'The layout',
    ) as Promise<LayoutResult>;
  }

  /** Stop the worker; pending and later requests resolve with an error. */
  dispose(): void {
    this.#disposed = true;
    this.#reset(failure('Error', 'The script runner was disposed.'));
  }

  #request(
    request: Request,
    timeoutMs: number,
    what: string,
  ): Promise<RunResult | LayoutResult> {
    if (this.#disposed) {
      return Promise.resolve(
        failure('Error', 'The script runner was disposed.'),
      );
    }
    const id = this.#nextId++;
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.#reset(
          failure(
            'TimeoutError',
            `${what} did not finish within ${timeoutMs / 1000} seconds and was stopped.`,
          ),
        );
      }, timeoutMs);
      this.#pending.set(id, {
        resolve: (response) => {
          const { id: _, ...result } = response as WorkerResponse;
          resolve(result as RunResult | LayoutResult);
        },
        timer,
      });
      try {
        this.#ensureWorker().postMessage({ ...request, id } as WorkerRequest);
      } catch (error) {
        this.#reset(
          failure('Error', `Could not start the worker: ${String(error)}`),
        );
      }
    });
  }

  #ensureWorker(): WorkerLike {
    if (this.#worker === null) {
      const worker = this.#createWorker();
      worker.onmessage = ({ data }) => {
        const pending = this.#pending.get(data.id);
        if (pending === undefined) return;
        this.#pending.delete(data.id);
        clearTimeout(pending.timer);
        pending.resolve(data);
      };
      worker.onerror = (event) => {
        event.preventDefault?.();
        this.#reset(
          failure(
            'Error',
            `The worker failed: ${event.message || 'unknown error'}`,
          ),
        );
      };
      this.#worker = worker;
    }
    return this.#worker;
  }

  #reset(result: { ok: false; error: RunError }): void {
    this.#worker?.terminate();
    this.#worker = null;
    for (const { resolve, timer } of this.#pending.values()) {
      clearTimeout(timer);
      resolve(result);
    }
    this.#pending.clear();
  }
}

function failure(
  name: string,
  message: string,
): { ok: false; error: RunError } {
  return { ok: false, error: { name, message } };
}
