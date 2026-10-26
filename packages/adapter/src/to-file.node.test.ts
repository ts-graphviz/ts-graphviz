import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Mock } from 'vitest';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./to-stream.node.js', () => ({ toStream: vi.fn() }));

import { toFile } from './to-file.node.js';
import { toStream } from './to-stream.node.js';

const dir = mkdtempSync(join(tmpdir(), 'ts-graphviz-to-file-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const streamOf = (...texts: string[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const text of texts) controller.enqueue(Buffer.from(text));
      controller.close();
    },
  });

describe('[SM-4] toFile (Node adapter)', () => {
  beforeEach(() => {
    vi.mocked(toStream).mockReset();
  });

  it('renders with the given options and replaces the file', async () => {
    const path = join(dir, 'replace.svg');
    writeFileSync(path, 'previous content that is longer');
    vi.mocked(toStream).mockResolvedValue(streamOf('<svg>', '</svg>'));
    await toFile('dot input', path, { layout: 'dot' });
    expect(toStream).toHaveBeenCalledWith('dot input', { layout: 'dot' });
    expect(readFileSync(path, 'utf8')).toBe('<svg></svg>');
  });

  it('should use default options when options not provided', async () => {
    const path = join(dir, 'default.svg');
    vi.mocked(toStream).mockResolvedValue(streamOf('out'));
    await toFile('dot input', path);
    expect(toStream).toHaveBeenCalledWith('dot input', undefined);
    expect(readFileSync(path, 'utf8')).toBe('out');
  });

  it('[SM-8] writes the whole file from the start whatever Object.prototype holds', async () => {
    const proto = Object.prototype as Record<string, unknown>;
    for (const [key, value] of [
      ['start', 3],
      ['flags', 'a'],
      ['fd', 1],
      ['encoding', 'hex'],
    ] as const) {
      const path = join(dir, `inherited-${key}.svg`);
      writeFileSync(path, '0123456789');
      vi.mocked(toStream).mockResolvedValue(streamOf('AB'));
      proto[key] = value;
      try {
        await toFile('dot input', path);
      } finally {
        delete proto[key];
      }
      expect(readFileSync(path, 'latin1'), key).toBe('AB');
    }
  });

  it('should propagate error when toStream rejects', async () => {
    const error = new Error('toStream error');
    (toStream as Mock).mockRejectedValueOnce(error);
    await expect(toFile('dot input', join(dir, 'never.svg'))).rejects.toThrow(
      error,
    );
  });

  it('should propagate error when the file cannot be opened', async () => {
    vi.mocked(toStream).mockResolvedValue(streamOf('out'));
    await expect(
      toFile('dot input', join(dir, 'missing-dir', 'out.svg')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });
});
