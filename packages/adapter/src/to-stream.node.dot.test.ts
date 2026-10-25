/**
 * The Node.js adapter against the real `dot` binary (skipped without it):
 * the process controls of #1680.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { toFile } from './to-file.node.js';
import { toStream } from './to-stream.node.js';

const hasDot = spawnSync('dot', ['-V']).status === 0;
const big = `digraph { ${Array.from({ length: 2000 }, (_, i) => `n${i} -> n${(i * 7) % 2000};`).join(' ')} }`;
const dir = mkdtempSync(join(tmpdir(), 'ts-graphviz-adapter-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe.skipIf(!hasDot)(
  '[SM-4] toStream / toFile with the real dot (#1680)',
  () => {
    it('renders', async () => {
      const stream = await toStream('digraph { a -> b }', { format: 'dot' });
      expect(await new Response(stream).text()).toContain('a -> b');
    });

    it('reports invalid DOT as CommandExecutionError with the stderr', async () => {
      await expect(
        toStream('digraph { a -> }', { sanitize: false }),
      ).rejects.toMatchObject({
        name: 'CommandExecutionError',
        code: 'TSG_ERR_COMMAND_FAILED',
        exit: { code: 1, stderr: expect.stringContaining('syntax error') },
      });
    });

    it('stops a command that writes more than maxOutputSize', async () => {
      await expect(
        toStream(big, { format: 'svg', maxOutputSize: 10_000 }),
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
        toStream('digraph {}', { attributes: { graph: { label: 'a\0b' } } }),
      ).rejects.toMatchObject({
        name: 'CommandExecutionError',
        code: 'TSG_ERR_COMMAND_FAILED',
      });
    });

    it('kills a command that stops reading its input and keeps running', async () => {
      // A stand-in for dot that closes stdin, records its pid and hangs; the
      // sleep is a child of the script and keeps the output pipes open.
      const script = join(dir, 'hang.sh');
      const pidFile = join(dir, 'hang.pid');
      writeFileSync(
        script,
        `#!/bin/sh\necho $$ > '${pidFile}'\nexec 0<&-\nsleep 60\n`,
        { mode: 0o755 },
      );
      const started = Date.now();
      // More than a pipe buffer, so writing the input fails (EPIPE).
      await expect(
        toStream(`digraph { ${'a -> b; '.repeat(50_000)} }`, {
          dotCommand: script,
          sanitize: false,
        }),
      ).rejects.toMatchObject({
        name: 'CommandExecutionError',
        code: 'TSG_ERR_COMMAND_FAILED',
      });
      expect(Date.now() - started).toBeLessThan(10_000);
      const pid = Number(readFileSync(pidFile, 'utf8'));
      expect(() => process.kill(pid, 0)).toThrow(
        expect.objectContaining({ code: 'ESRCH' }),
      );
    });

    it('settles when the command exits with a status while a child holds its pipes', async () => {
      // Closes stdin, leaves a background child holding stdout/stderr and
      // exits with status 3 right away.
      const script = join(dir, 'exit3.sh');
      writeFileSync(script, '#!/bin/sh\nexec 0<&-\nsleep 30 &\nexit 3\n', {
        mode: 0o755,
      });
      const started = Date.now();
      const error = await toStream(`digraph { ${'a -> b; '.repeat(50_000)} }`, {
        dotCommand: script,
        sanitize: false,
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
      await toFile('digraph { a }', path, { format: 'dot' });
      expect(readFileSync(path, 'utf8')).not.toContain('XXXX');
    });
  },
);

describe.skipIf(!hasDot)(
  '[SM-7] toStream / toFile check the source with sanitize (#1681)',
  () => {
    const secret = join(dir, 'secret.eps');
    writeFileSync(
      secret,
      '%!PS-Adobe-3.0 EPSF-3.0\n%%BoundingBox: 0 0 10 10\n% SECRET-CONTENT\n',
    );
    const leak = `digraph { a [shape=epsf shapefile="${secret}"] }`;

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

    it('renders the source unchecked with sanitize: false', async () => {
      // Graphviz itself copies the file into the output: what sanitize prevents.
      const stream = await toStream(leak, { format: 'ps', sanitize: false });
      expect(await new Response(stream).text()).toContain('SECRET-CONTENT');
    });
  },
);
