import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PLAYGROUND_MODULES } from './modules';
import type { RunRequest, RunResponse } from './protocol';
import { runScript } from './run-script';
import { ScriptRunner, type WorkerLike } from './runner';

/** A worker that answers on demand, so tests control timing. */
class FakeWorker implements WorkerLike {
  onmessage: WorkerLike['onmessage'] = null;
  onerror: WorkerLike['onerror'] = null;
  readonly received: RunRequest[] = [];
  terminated = false;

  postMessage(message: RunRequest): void {
    this.received.push(message);
  }
  terminate(): void {
    this.terminated = true;
  }
  /** Answer a request the way worker.ts does. */
  respond(request = this.received[this.received.length - 1]): void {
    const data: RunResponse = {
      id: request.id,
      ...runScript(request.source, PLAYGROUND_MODULES),
    };
    this.onmessage?.({ data } as MessageEvent<RunResponse>);
  }
  fail(message: string): void {
    this.onerror?.({ message, preventDefault() {} } as ErrorEvent);
  }
}

describe('ScriptRunner', () => {
  let workers: FakeWorker[];
  let runner: ScriptRunner;

  beforeEach(() => {
    vi.useFakeTimers();
    workers = [];
    runner = new ScriptRunner({
      createWorker: () => {
        const worker = new FakeWorker();
        workers.push(worker);
        return worker;
      },
      timeoutMs: 1000,
    });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates the worker lazily and reuses it', async () => {
    expect(workers).toHaveLength(0);
    const first = runner.run("'digraph {}'");
    workers[0].respond();
    await expect(first).resolves.toEqual({ ok: true, dot: 'digraph {}' });

    const second = runner.run("'graph {}'");
    workers[0].respond();
    await expect(second).resolves.toEqual({ ok: true, dot: 'graph {}' });
    expect(workers).toHaveLength(1);
  });

  it('matches responses to their runs', async () => {
    const a = runner.run("'graph a {}'");
    const b = runner.run("'graph b {}'");
    const [ra, rb] = workers[0].received;
    workers[0].respond(rb);
    workers[0].respond(ra);
    await expect(a).resolves.toEqual({ ok: true, dot: 'graph a {}' });
    await expect(b).resolves.toEqual({ ok: true, dot: 'graph b {}' });
  });

  it('passes script failures through', async () => {
    const result = runner.run("throw new TypeError('bad');");
    workers[0].respond();
    await expect(result).resolves.toEqual({
      ok: false,
      error: { name: 'TypeError', message: 'bad' },
    });
  });

  it('stops a script that runs too long and starts a new worker', async () => {
    const stuck = runner.run('while (true) {}');
    const alsoPending = runner.run("'digraph {}'");
    vi.advanceTimersByTime(1000);
    const timeout = {
      ok: false,
      error: {
        name: 'TimeoutError',
        message: 'The script did not finish within 1 seconds and was stopped.',
      },
    };
    await expect(stuck).resolves.toEqual(timeout);
    await expect(alsoPending).resolves.toEqual(timeout);
    expect(workers[0].terminated).toBe(true);

    const next = runner.run("'digraph {}'");
    expect(workers).toHaveLength(2);
    workers[1].respond();
    await expect(next).resolves.toEqual({ ok: true, dot: 'digraph {}' });
  });

  it('does not time out a run that answered', async () => {
    const result = runner.run("'digraph {}'");
    workers[0].respond();
    await result;
    vi.advanceTimersByTime(5000);
    expect(workers[0].terminated).toBe(false);
  });

  it('ignores responses for runs it no longer waits for', async () => {
    const result = runner.run("'digraph {}'");
    vi.advanceTimersByTime(1000);
    await result;
    expect(() => workers[0].respond()).not.toThrow();
  });

  it('recovers from a worker error', async () => {
    const result = runner.run("'digraph {}'");
    workers[0].fail('script error');
    await expect(result).resolves.toEqual({
      ok: false,
      error: {
        name: 'Error',
        message: 'The script worker failed: script error',
      },
    });
    expect(workers[0].terminated).toBe(true);
    const next = runner.run("'digraph {}'");
    workers[1].respond();
    await expect(next).resolves.toMatchObject({ ok: true });
  });

  it('reports a worker that cannot be created', async () => {
    const broken = new ScriptRunner({
      createWorker: () => {
        throw new Error('no workers here');
      },
    });
    await expect(broken.run("'digraph {}'")).resolves.toEqual({
      ok: false,
      error: {
        name: 'Error',
        message: 'Could not start the script: Error: no workers here',
      },
    });
  });

  it('resolves pending and later runs after dispose', async () => {
    const pending = runner.run("'digraph {}'");
    runner.dispose();
    const disposed = {
      ok: false,
      error: { name: 'Error', message: 'The script runner was disposed.' },
    };
    await expect(pending).resolves.toEqual(disposed);
    await expect(runner.run("'digraph {}'")).resolves.toEqual(disposed);
    expect(workers[0].terminated).toBe(true);
    expect(workers).toHaveLength(1);
  });
});
