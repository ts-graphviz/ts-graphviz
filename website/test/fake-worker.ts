import { type GraphvizLike, layout } from '../src/playground/runtime/layout';
import { PLAYGROUND_MODULES } from '../src/playground/runtime/modules';
import type {
  WorkerRequest,
  WorkerResponse,
} from '../src/playground/runtime/protocol';
import { runScript } from '../src/playground/runtime/run-script';
import type { WorkerLike } from '../src/playground/runtime/runner';

/** A Graphviz stand-in: `<svg>` around the DOT; DOT containing `!` fails. */
export const fakeGraphviz: GraphvizLike = {
  version: () => '99.0.0',
  layout: (dot, _format, engine) => {
    if (dot.includes('!')) throw new Error(`syntax error near '!'`);
    return `<svg data-engine="${engine}">${dot}</svg>`;
  },
};

/**
 * A worker that answers only when told to, the way worker.ts would (with
 * {@link fakeGraphviz} for layouts), so tests control timing and order.
 */
export class FakeWorker implements WorkerLike {
  static instances: FakeWorker[] = [];
  onmessage: WorkerLike['onmessage'] = null;
  onerror: WorkerLike['onerror'] = null;
  readonly queue: WorkerRequest[] = [];
  terminated = false;

  constructor() {
    FakeWorker.instances.push(this);
  }
  postMessage(message: WorkerRequest): void {
    this.queue.push(message);
  }
  terminate(): void {
    this.terminated = true;
  }
  /** Answer one request (the latest by default) and drop it from the queue. */
  respond(request = this.queue[this.queue.length - 1]): void {
    this.queue.splice(this.queue.indexOf(request), 1);
    const data: WorkerResponse =
      request.type === 'run'
        ? { id: request.id, ...runScript(request.source, PLAYGROUND_MODULES) }
        : {
            id: request.id,
            ...layout(fakeGraphviz, request.dot, request.engine),
          };
    this.onmessage?.({ data } as MessageEvent<WorkerResponse>);
  }
  /** Answer every queued request, oldest first. */
  respondAll(): void {
    while (this.queue.length > 0) this.respond(this.queue[0]);
  }
  fail(message: string): void {
    this.onerror?.({ message, preventDefault() {} } as ErrorEvent);
  }
}
