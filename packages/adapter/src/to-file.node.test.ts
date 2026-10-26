import { closeSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock toStream so that the tests do not need Graphviz
vi.mock('./to-stream.node.js', () => ({
  toStream: vi.fn(),
}));

// Import after mocking
import { toFile } from './to-file.node.js';
import { toStream } from './to-stream.node.js';

describe('toFile (Node adapter)', () => {
  let dir: string;
  let path: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    dir = await mkdtemp(join(tmpdir(), 'ts-graphviz-to-file-'));
    path = join(dir, 'output');
    (toStream as Mock).mockImplementation(async () =>
      Readable.from([Buffer.from('AB'), Buffer.from('CD')]),
    );
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('should write the output of toStream to the file', async () => {
    await toFile('dot input', path, { layout: 'dot' });
    expect(toStream).toHaveBeenCalledWith('dot input', { layout: 'dot' });
    expect(readFileSync(path, 'latin1')).toBe('ABCD');
  });

  it('should replace an existing file', async () => {
    writeFileSync(path, 'existing content');
    await toFile('dot input', path);
    expect(toStream).toHaveBeenCalledWith('dot input', undefined);
    expect(readFileSync(path, 'latin1')).toBe('ABCD');
  });

  it('should write the whole file whatever Object.prototype holds', async () => {
    const other = join(dir, 'other');
    writeFileSync(other, '');
    const fd = openSync(other, 'w');
    const proto = Object.prototype as Record<string, unknown>;
    proto.start = 3;
    proto.fd = fd;
    proto.flags = 'a';
    try {
      writeFileSync(path, 'existing content');
      await toFile('dot input', path);
    } finally {
      delete proto.start;
      delete proto.fd;
      delete proto.flags;
      try {
        closeSync(fd);
      } catch {
        // already closed by the code under test
      }
    }
    expect(readFileSync(path, 'latin1')).toBe('ABCD');
    expect(readFileSync(other, 'latin1')).toBe('');
  });

  it('should propagate error when toStream rejects', async () => {
    const error = new Error('toStream error');
    (toStream as Mock).mockRejectedValueOnce(error);
    await expect(toFile('dot input', path)).rejects.toThrow(error);
  });

  it('should stop the output stream when the file cannot be opened', async () => {
    const stream = Readable.from([Buffer.from('AB')]);
    (toStream as Mock).mockImplementationOnce(async () => stream);
    await expect(
      toFile('dot input', join(dir, 'missing', 'output')),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    expect(stream.destroyed).toBe(true);
  });

  it('should write string chunks as UTF-8 and an empty output as an empty file', async () => {
    (toStream as Mock).mockImplementationOnce(async () =>
      Readable.from(['é'], { objectMode: true }),
    );
    await toFile('dot input', path);
    expect(readFileSync(path, 'utf8')).toBe('é');
    writeFileSync(path, 'existing content');
    (toStream as Mock).mockImplementationOnce(async () => Readable.from([]));
    await toFile('dot input', path);
    expect(readFileSync(path, 'latin1')).toBe('');
  });

  it('should propagate error when the stream fails', async () => {
    const error = new Error('stream error');
    (toStream as Mock).mockImplementationOnce(async () =>
      Readable.from(
        (async function* () {
          yield Buffer.from('AB');
          throw error;
        })(),
      ),
    );
    await expect(toFile('dot input', path)).rejects.toThrow(error);
  });
});
