import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('./to-stream.node.js', () => ({
  toStream: vi.fn().mockResolvedValue('stream'),
}));
vi.mock('node:fs', () => ({
  createWriteStream: vi.fn().mockReturnValue('writeStream'),
}));
vi.mock('node:stream/promises', () => ({
  pipeline: vi.fn().mockResolvedValue(undefined),
}));

import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
// Import after mocking
import { toFile } from './to-file.node.js';
import { toStream } from './to-stream.node.js';

describe('toFile (Node adapter)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call toStream, createWriteStream, and pipeline with provided options', async () => {
    await toFile('dot input', '/path/output', { layout: 'dot' });
    expect(toStream).toHaveBeenCalledWith('dot input', { layout: 'dot' });
    expect(createWriteStream).toHaveBeenCalledWith('/path/output');
    expect(pipeline).toHaveBeenCalledWith('stream', 'writeStream');
  });

  it('should use default options when options not provided', async () => {
    await toFile('dot input', '/path/output');
    expect(toStream).toHaveBeenCalledWith('dot input', undefined);
    expect(createWriteStream).toHaveBeenCalledWith('/path/output');
    expect(pipeline).toHaveBeenCalledWith('stream', 'writeStream');
  });

  it('should propagate error when toStream rejects', async () => {
    const error = new Error('toStream error');
    (toStream as Mock).mockRejectedValueOnce(error);
    await expect(toFile('dot input', '/path/output')).rejects.toThrow(error);
  });

  it('should propagate error when pipeline rejects', async () => {
    const error = new Error('pipeline error');
    (pipeline as Mock).mockRejectedValueOnce(error);
    await expect(
      toFile('dot input', '/path/output', { layout: 'dot' }),
    ).rejects.toThrow(error);
  });
});
