/**
 * The stderr tail through the Node.js `toStream`, with a real process that
 * stands in for `dot`: a Node.js script that floods stderr and fails.
 */
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { toStream } from './to-stream.node.js';

let dir: string;

/** `size` ASCII bytes in a pattern that shows where they came from. */
const pattern = (size: number) =>
  Buffer.from(Array.from({ length: size }, (_, i) => 32 + ((i * 7) % 95)));

/**
 * A command that reads its stdin, then writes `bytes` to stderr in chunks
 * of `chunkSize` bytes and exits with code 1.
 */
function failingCommand(name: string, bytes: Buffer, chunkSize: number) {
  const path = join(dir, name);
  writeFileSync(
    path,
    `#!${process.execPath}
const { readFileSync, writeSync } = require('node:fs');
readFileSync(0);
const bytes = Buffer.from(${JSON.stringify(bytes.toString('base64'))}, 'base64');
for (let i = 0; i < bytes.length; i += ${chunkSize}) {
  writeSync(2, bytes.subarray(i, i + ${chunkSize}));
}
process.exitCode = 1;
`,
  );
  chmodSync(path, 0o755);
  return path;
}

async function stderrOf(dotCommand: string): Promise<string> {
  const error = await toStream('digraph {}', {
    dotCommand,
    signal: AbortSignal.timeout(10_000),
  }).then(
    () => expect.unreachable('the command fails'),
    (e) => e,
  );
  expect(error).toMatchObject({
    name: 'CommandExecutionError',
    code: 'TSG_ERR_COMMAND_FAILED',
    exit: { code: 1 },
  });
  return error.exit.stderr;
}

// The stand-in's shebang names the Node.js binary: a path with whitespace
// cannot be one.
describe.skipIf(process.platform === 'win32' || /\s/.test(process.execPath))(
  'the stderr of a failed command (Node.js)',
  { tags: ['SM-4', 'process'] },
  () => {
    beforeAll(() => {
      dir = mkdtempSync(join(tmpdir(), 'ts-graphviz-stderr-'));
    });
    afterAll(() => rmSync(dir, { recursive: true, force: true }));

    it('keeps exactly its last 64 KiB', async () => {
      const bytes = pattern(1024 * 1024);
      const stderr = await stderrOf(failingCommand('flood.js', bytes, 3500));
      expect(stderr).toBe(bytes.subarray(-64 * 1024).toString('latin1'));
    });

    it('keeps its last 64 KiB after a large write and a small one', async () => {
      const bytes = pattern(64 * 1024 + 1);
      const stderr = await stderrOf(
        failingCommand('large-small.js', bytes, 64 * 1024),
      );
      expect(stderr).toBe(bytes.subarray(-64 * 1024).toString('latin1'));
    });

    it('decodes it as UTF-8 and leaves out a character cut at the start', async () => {
      const rest = pattern(64 * 1024 - 2);
      const bytes = Buffer.concat([
        Buffer.from('déjà vu €'),
        Buffer.from('€'),
        rest,
      ]);
      const stderr = await stderrOf(failingCommand('utf8.js', bytes, 1000));
      expect(stderr).toBe(rest.toString('latin1'));
    });

    it('keeps short UTF-8 stderr as it was written', async () => {
      const text = 'Error: déjà vu € 𝄞\n';
      const stderr = await stderrOf(
        failingCommand('short.js', Buffer.from(text), 1),
      );
      expect(stderr).toBe(text);
    });
  },
);
