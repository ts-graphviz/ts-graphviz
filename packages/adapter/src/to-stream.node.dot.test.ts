/**
 * The Node.js adapter against the real `dot` binary (skipped without it):
 * the process controls of #1680. Every test here starts a process, so the
 * file starts none while it is loaded (`pnpm test` loads it and runs none).
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { toFile } from './to-file.node.js';
import { toStream } from './to-stream.node.js';

let dotInstalled: boolean | undefined;
/** Whether `dot` runs, asked by the first test that needs it. */
const hasDot = () =>
  (dotInstalled ??= spawnSync('dot', ['-V'], { timeout: 10_000 }).status === 0);
const big = `digraph { ${Array.from({ length: 2000 }, (_, i) => `n${i} -> n${(i * 7) % 2000};`).join(' ')} }`;
/** Commands that last longer than any test here are killed after it. */
const signal = () => AbortSignal.timeout(30_000);

let dir: string;
/** Files where a stand-in recorded the pid of its background child. */
const children: string[] = [];
/** A temporary directory for the tests of a describe, removed after them. */
function useTempDir() {
  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'ts-graphviz-adapter-'));
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));
  beforeEach(({ skip }) => skip(!hasDot(), 'dot is not installed'));
  // Right after the test, while the child (a sleep of 30 s or more) still
  // runs, so that its pid has not gone to another process.
  afterEach(() => {
    for (const pidFile of children.splice(0)) {
      try {
        process.kill(Number(readFileSync(pidFile, 'utf8')), 'SIGKILL');
      } catch {
        // already gone, or never started
      }
    }
  });
}

describe('toStream / toFile with the real dot (#1680)', {
  tags: ['SM-4', 'process'],
}, () => {
  useTempDir();

  it('renders and writes the file whatever Object.prototype holds', {
    tags: ['SM-8'],
  }, async () => {
    const proto = Object.prototype as Record<string, unknown>;
    for (const [key, value] of [
      ['allowHalfOpen', true],
      ['defaultEncoding', 'hex'],
      ['encoding', 'hex'],
      ['start', 3],
      ['fd', 1],
    ] as const) {
      const path = join(dir, `inherited-${key}.dot`);
      writeFileSync(path, 'previous content');
      proto[key] = value;
      try {
        const stream = await toStream('digraph { a -> b }', {
          format: 'dot',
          signal: AbortSignal.timeout(5000),
        });
        expect(await new Response(stream).text(), key).toContain('a -> b');
        await toFile('digraph { a -> b }', path, {
          format: 'dot',
          signal: AbortSignal.timeout(5000),
        });
      } finally {
        delete proto[key];
      }
      expect(readFileSync(path, 'utf8'), key).toMatch(/^digraph/);
    }
  });

  it('gives the bytes dot writes for a binary format', async () => {
    const dot = 'digraph { a -> b -> c; b -> d }';
    const stream = await toStream(dot, { format: 'png', signal: signal() });
    const bytes = Buffer.from(await new Response(stream).arrayBuffer());
    const direct = spawnSync('dot', ['-q', '-Tpng'], {
      input: dot,
      timeout: 30_000,
    }).stdout;
    expect(bytes.equals(direct)).toBe(true);
  });

  it('renders', async () => {
    const stream = await toStream('digraph { a -> b }', {
      format: 'dot',
      signal: signal(),
    });
    expect(await new Response(stream).text()).toContain('a -> b');
  });

  it('reports invalid DOT as CommandExecutionError with the stderr', async () => {
    await expect(
      toStream('digraph { a -> }', { sanitize: false, signal: signal() }),
    ).rejects.toMatchObject({
      name: 'CommandExecutionError',
      code: 'TSG_ERR_COMMAND_FAILED',
      exit: { code: 1, stderr: expect.stringContaining('syntax error') },
    });
  });

  it('stops a command that writes more than maxOutputSize', async () => {
    await expect(
      toStream(big, {
        format: 'svg',
        maxOutputSize: 10_000,
        signal: signal(),
      }),
    ).rejects.toMatchObject({
      name: 'RangeError',
      code: 'TSG_ERR_OUTPUT_LIMIT_EXCEEDED',
    });
  });

  it('kills the command when the signal aborts and rejects with its reason', async () => {
    const started = Date.now();
    await expect(
      toStream(big, {
        format: 'svg',
        layout: 'neato',
        signal: AbortSignal.timeout(200),
      }),
    ).rejects.toMatchObject({ name: 'TimeoutError' });
    expect(Date.now() - started).toBeLessThan(5_000);
  });

  it('rejects an already aborted signal without starting the command', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      toStream('digraph {}', { signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('reports an argument the OS cannot pass as CommandExecutionError', async () => {
    await expect(
      // `library` is configuration: checked to be strings, not for NUL.
      toStream('digraph {}', {
        library: ['a\0b'],
        sanitize: false,
        signal: signal(),
      }),
    ).rejects.toMatchObject({
      name: 'CommandExecutionError',
      code: 'TSG_ERR_COMMAND_FAILED',
    });
  });

  it('kills a command that stops reading its input and keeps running', async () => {
    // A stand-in for dot that records its pid, closes stdin and hangs; the
    // sleep is a child of the script and keeps the output pipes open. The
    // script finds where to write the pids from its own path ($0), so no
    // path is part of the shell text; the sleep is killed after the tests.
    const script = join(dir, 'hang.sh');
    writeFileSync(
      script,
      '#!/bin/sh\nsleep 60 </dev/null &\necho $! > "$0.child"\necho $$ > "$0.pid"\nexec 0<&-\nwait\n',
      { mode: 0o755 },
    );
    children.push(`${script}.child`);
    const started = Date.now();
    // More than a pipe buffer, so writing the input fails (EPIPE).
    await expect(
      toStream(`digraph { ${'a -> b; '.repeat(50_000)} }`, {
        dotCommand: script,
        sanitize: false,
        signal: signal(),
      }),
    ).rejects.toMatchObject({
      name: 'CommandExecutionError',
      code: 'TSG_ERR_COMMAND_FAILED',
    });
    expect(Date.now() - started).toBeLessThan(10_000);
    const pid = Number(readFileSync(`${script}.pid`, 'utf8'));
    expect(() => process.kill(pid, 0)).toThrow(
      expect.objectContaining({ code: 'ESRCH' }),
    );
  });

  it('settles when the command exits with a status while a child holds its pipes', async () => {
    // Leaves a background child holding stdout/stderr (its pid recorded
    // next to the script, to kill it after the tests), closes stdin and
    // exits with status 3 right away.
    const script = join(dir, 'exit3.sh');
    writeFileSync(
      script,
      '#!/bin/sh\nsleep 30 </dev/null &\necho $! > "$0.child"\nexec 0<&-\nexit 3\n',
      { mode: 0o755 },
    );
    children.push(`${script}.child`);
    const started = Date.now();
    const error = await toStream(`digraph { ${'a -> b; '.repeat(50_000)} }`, {
      dotCommand: script,
      sanitize: false,
      signal: signal(),
    }).catch((e: unknown) => e);
    expect(error).toMatchObject({ name: 'CommandExecutionError' });
    // Which comes first is up to the OS: the script exits with 3, or the
    // write fails first and the call kills the script (no exit code).
    expect([3, null]).toContain(
      (error as { exit?: { code: number | null } }).exit?.code,
    );
    expect(Date.now() - started).toBeLessThan(10_000);
  });

  it('toFile replaces an existing longer file', async () => {
    const path = join(dir, 'out.dot');
    writeFileSync(path, 'X'.repeat(5000));
    await toFile('digraph { a }', path, { format: 'dot', signal: signal() });
    expect(readFileSync(path, 'utf8')).not.toContain('XXXX');
  });
});

describe('toStream / toFile check the source with sanitize (#1681)', {
  tags: ['SM-7', 'process'],
}, () => {
  useTempDir();
  let secret: string;
  let leak: string;
  beforeAll(() => {
    secret = join(dir, 'secret.eps');
    writeFileSync(
      secret,
      '%!PS-Adobe-3.0 EPSF-3.0\n%%BoundingBox: 0 0 10 10\n% SECRET-CONTENT\n',
    );
    leak = `digraph { a [shape=epsf shapefile="${secret}"] }`;
  });

  it('rejects a source that reads a file, before running the command', async () => {
    await expect(toStream(leak, { format: 'ps' })).rejects.toMatchObject({
      name: 'SecurityError',
      code: 'TSG_ERR_UNSAFE_DOT',
    });
    const path = join(dir, 'not-written.ps');
    await expect(toFile(leak, path, { format: 'ps' })).rejects.toMatchObject({
      code: 'TSG_ERR_UNSAFE_DOT',
    });
    expect(() => readFileSync(path)).toThrow();
  });

  it('rejects a javascript: link', async () => {
    await expect(
      toStream('digraph { a [URL="javascript:alert(1)"] }'),
    ).rejects.toMatchObject({ code: 'TSG_ERR_UNSAFE_DOT' });
  });

  it('rejects DOT that does not parse with DotSyntaxError', async () => {
    await expect(toStream('digraph { a -> }')).rejects.toMatchObject({
      name: 'DotSyntaxError',
      code: 'TSG_ERR_DOT_SYNTAX',
    });
  });

  it('passes parser limits on', async () => {
    await expect(
      toStream('digraph { a; b; c }', { sanitize: { maxASTNodes: 3 } }),
    ).rejects.toMatchObject({ code: 'TSG_ERR_DOT_SYNTAX' });
  });

  it('checks the attributes option, which reaches dot as -G/-N/-E arguments', async () => {
    await expect(
      toStream('digraph { a }', {
        format: 'ps',
        attributes: { node: { shape: 'epsf', shapefile: secret } as never },
      }),
    ).rejects.toMatchObject({ code: 'TSG_ERR_UNSAFE_DOT' });
    // dot splits an argument at its first '=': this key would set
    // `image`. Such a key is refused as an option, sanitize or not.
    for (const sanitize of [true, false]) {
      await expect(
        toStream('digraph { a }', {
          attributes: { node: { [`image=${secret}`]: true } as never },
          sanitize,
        }),
      ).rejects.toMatchObject({ code: 'TSG_ERR_INVALID_OPTION' });
    }
    await expect(
      toStream('digraph { a }', {
        attributes: { node: { image: secret } as never },
      }),
    ).rejects.toMatchObject({ code: 'TSG_ERR_UNSAFE_DOT' });
    // So is a NUL, which no command-line argument can hold.
    await expect(
      toStream('digraph { a }', {
        attributes: { graph: { label: 'a\0b' } },
      }),
    ).rejects.toMatchObject({ code: 'TSG_ERR_INVALID_OPTION' });
    const stream = await toStream('digraph { a }', {
      format: 'dot',
      signal: signal(),
      attributes: {
        graph: { rankdir: 'LR', label: 'Title "quoted"' },
        node: { shape: 'box', fontname: 'Helvetica' },
        edge: { color: 'red' },
      },
    });
    expect(await new Response(stream).text()).toContain('rankdir=LR');
  });

  it('passes the policy on, and checks for its own format', async () => {
    await expect(
      toStream('digraph { a [foo=x] }', { sanitize: { policy: 'strict' } }),
    ).rejects.toMatchObject({ code: 'TSG_ERR_UNSAFE_DOT' });
    await expect(
      toStream('digraph { a [fontname="Times New Roman"] }', {
        format: 'ps',
      }),
    ).rejects.toMatchObject({ code: 'TSG_ERR_UNSAFE_DOT' });
    const svg = await toStream('digraph { a [fontname="Times New Roman"] }', {
      signal: signal(),
    });
    expect(await new Response(svg).text()).toContain('Times New Roman');
    await expect(
      toStream('digraph { a }', { format: 'vml' as 'svg' }),
    ).rejects.toMatchObject({ code: 'TSG_ERR_UNSAFE_DOT' });
  });

  it('renders the source unchecked with sanitize: false', async () => {
    // Graphviz itself copies the file into the output: what sanitize prevents.
    const stream = await toStream(leak, {
      format: 'ps',
      sanitize: false,
      signal: signal(),
    });
    expect(await new Response(stream).text()).toContain('SECRET-CONTENT');
  });
});
