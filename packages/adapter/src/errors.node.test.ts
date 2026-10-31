/**
 * The message of a failed command through the Node.js `toStream`, with a
 * real process that stands in for `dot`: a Node.js script that writes
 * terminal escape sequences and a lot of text to stderr, and fails.
 */
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { toStream } from './to-stream.node.js';

let dir: string;

const ESC = String.fromCharCode(0x1b);

// The stand-in's shebang names the Node.js binary: a path with whitespace
// cannot be one.
describe.skipIf(process.platform === 'win32' || /\s/.test(process.execPath))(
  'the message of a failed command (Node.js)',
  { tags: ['SM-4', 'process'] },
  () => {
    beforeAll(() => {
      dir = mkdtempSync(join(tmpdir(), 'ts-graphviz-message-'));
    });
    afterAll(() => rmSync(dir, { recursive: true, force: true }));

    it('is bounded for a large stderr', async () => {
      const stderr = `${ESC}[2J${ESC}]0;title\u0007\rError: /home/user/secret.dot\n${'x'.repeat(100_000)}`;
      const path = join(dir, 'escapes.js');
      writeFileSync(
        path,
        `#!${process.execPath}
require('node:fs').readFileSync(0);
process.stderr.write(${JSON.stringify(stderr)});
process.exitCode = 3;
`,
      );
      chmodSync(path, 0o755);
      const error = await toStream('digraph {}', {
        dotCommand: path,
        signal: AbortSignal.timeout(10_000),
      }).then(
        () => expect.unreachable('the command fails'),
        (e) => e,
      );
      expect(error).toMatchObject({
        name: 'CommandExecutionError',
        code: 'TSG_ERR_COMMAND_FAILED',
        exit: { code: 3 },
      });
      // exit.stderr has the end of stderr (at most 64 KiB), unescaped.
      expect(error.exit.stderr.length).toBeLessThanOrEqual(64 * 1024);
      expect(stderr.endsWith(error.exit.stderr)).toBe(true);
      // The kept stderr starts within the x's: its start is in the message.
      expect(error.message.length).toBeLessThan(256 + 1024 + 100);
      expect(error.message).toContain('CODE: 3\nSIGNAL: null\nMESSAGE: xxx');
      expect(error.message).toMatch(/… \(\d+ more characters\)$/);
    });

    it('escapes the escape sequences of a short stderr and keeps its lines', async () => {
      const stderr = `${ESC}[31mError${ESC}[0m: syntax error\r\nline 2\n`;
      const path = join(dir, 'short.js');
      writeFileSync(
        path,
        `#!${process.execPath}
require('node:fs').readFileSync(0);
process.stderr.write(${JSON.stringify(stderr)});
process.exitCode = 1;
`,
      );
      chmodSync(path, 0o755);
      const error = await toStream('digraph {}', {
        dotCommand: path,
        signal: AbortSignal.timeout(10_000),
      }).then(
        () => expect.unreachable('the command fails'),
        (e) => e,
      );
      expect(error.exit.stderr).toBe(stderr);
      expect(error.message).toBe(
        `Command "${path}" failed.\nCODE: 1\nSIGNAL: null\nMESSAGE: \\x1B[31mError\\x1B[0m: syntax error\\x0D\nline 2\n`,
      );
    });
  },
);
