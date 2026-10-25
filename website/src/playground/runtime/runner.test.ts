import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FakeWorker } from '../../../test/fake-worker';
import { ScriptRunner } from './runner';

describe('ScriptRunner', () => {
  let runner: ScriptRunner;
  const worker = (n: number) => FakeWorker.instances[n];

  beforeEach(() => {
    vi.useFakeTimers();
    FakeWorker.instances = [];
    runner = new ScriptRunner({
      createWorker: () => new FakeWorker(),
      timeoutMs: 1000,
      layoutTimeoutMs: 3000,
    });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates the worker lazily and reuses it', async () => {
    expect(FakeWorker.instances).toHaveLength(0);
    const first = runner.run("'digraph {}'");
    worker(0).respond();
    await expect(first).resolves.toEqual({ ok: true, dot: 'digraph {}' });

    const second = runner.layout('graph {}', 'neato');
    worker(0).respond();
    await expect(second).resolves.toEqual({
      ok: true,
      svg: '<svg data-engine="neato">graph {}</svg>',
      version: '99.0.0',
    });
    expect(FakeWorker.instances).toHaveLength(1);
  });

  it('matches responses to their requests', async () => {
    const a = runner.run("'graph a {}'");
    const b = runner.layout('graph b {}', 'dot');
    const [ra, rb] = worker(0).queue;
    worker(0).respond(rb);
    worker(0).respond(ra);
    await expect(a).resolves.toEqual({ ok: true, dot: 'graph a {}' });
    await expect(b).resolves.toMatchObject({
      ok: true,
      svg: expect.stringContaining('graph b'),
    });
  });

  it('passes failures through', async () => {
    const script = runner.run("throw new TypeError('bad');");
    worker(0).respond();
    await expect(script).resolves.toEqual({
      ok: false,
      error: { name: 'TypeError', message: 'bad' },
    });
    const layout = runner.layout('digraph { ! }', 'dot');
    worker(0).respond();
    await expect(layout).resolves.toEqual({
      ok: false,
      error: { name: 'Error', message: "syntax error near '!'" },
    });
  });

  it('stops a script that runs too long and starts a new worker', async () => {
    const stuck = runner.run('while (true) {}');
    const alsoPending = runner.layout('digraph {}', 'dot');
    vi.advanceTimersByTime(1000);
    const timeout = {
      ok: false,
      error: {
        name: 'TimeoutError',
        message: 'The script did not finish within 1 seconds and was stopped.',
      },
    };
    await expect(stuck).resolves.toEqual(timeout);
    // Everything in the worker goes down with it.
    await expect(alsoPending).resolves.toEqual(timeout);
    expect(worker(0).terminated).toBe(true);

    const next = runner.run("'digraph {}'");
    expect(FakeWorker.instances).toHaveLength(2);
    worker(1).respond();
    await expect(next).resolves.toEqual({ ok: true, dot: 'digraph {}' });
  });

  it('gives layouts their own timeout', async () => {
    const layout = runner.layout('digraph {}', 'dot');
    vi.advanceTimersByTime(2999);
    expect(worker(0).terminated).toBe(false);
    vi.advanceTimersByTime(1);
    await expect(layout).resolves.toEqual({
      ok: false,
      error: {
        name: 'TimeoutError',
        message: 'The layout did not finish within 3 seconds and was stopped.',
      },
    });
    expect(worker(0).terminated).toBe(true);
  });

  it('does not time out a request that was answered', async () => {
    const result = runner.run("'digraph {}'");
    worker(0).respond();
    await result;
    vi.advanceTimersByTime(5000);
    expect(worker(0).terminated).toBe(false);
  });

  it('ignores responses for requests it no longer waits for', async () => {
    const result = runner.run("'digraph {}'");
    const [request] = worker(0).queue;
    vi.advanceTimersByTime(1000);
    await result;
    worker(0).queue.push(request);
    expect(() => worker(0).respond()).not.toThrow();
  });

  it('recovers from a worker error', async () => {
    const result = runner.run("'digraph {}'");
    worker(0).fail('script error');
    await expect(result).resolves.toEqual({
      ok: false,
      error: { name: 'Error', message: 'The worker failed: script error' },
    });
    expect(worker(0).terminated).toBe(true);
    const next = runner.run("'digraph {}'");
    worker(1).respond();
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
        message: 'Could not start the worker: Error: no workers here',
      },
    });
  });

  it('resolves pending and later requests after dispose', async () => {
    const pending = runner.run("'digraph {}'");
    runner.dispose();
    const disposed = {
      ok: false,
      error: { name: 'Error', message: 'The script runner was disposed.' },
    };
    await expect(pending).resolves.toEqual(disposed);
    await expect(runner.run("'digraph {}'")).resolves.toEqual(disposed);
    await expect(runner.layout('digraph {}', 'dot')).resolves.toEqual(disposed);
    expect(worker(0).terminated).toBe(true);
    expect(FakeWorker.instances).toHaveLength(1);
  });
});
