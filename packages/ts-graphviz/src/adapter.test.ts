import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@ts-graphviz/adapter', () => ({
  toStream: vi.fn().mockResolvedValue('stream'),
  toFile: vi.fn().mockResolvedValue(undefined),
}));

import * as adapter from '@ts-graphviz/adapter';
import { toFile, toStream } from './adapter.js';
import { digraph, toDot } from './ts-graphviz.js';

describe('ts-graphviz/adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes a DOT string through', async () => {
    await expect(toStream('digraph {}', { format: 'svg' })).resolves.toBe(
      'stream',
    );
    expect(adapter.toStream).toHaveBeenCalledWith('digraph {}', {
      format: 'svg',
    });
  });

  it('renders a model with toDot first', async () => {
    const g = digraph('G', (g) => {
      g.edge(['a', 'b']);
    });
    await toStream(g);
    expect(adapter.toStream).toHaveBeenCalledWith(toDot(g), undefined);
    await toFile(g, '/out.svg', { layout: 'neato' });
    expect(adapter.toFile).toHaveBeenCalledWith(toDot(g), '/out.svg', {
      layout: 'neato',
    });
  });
});
