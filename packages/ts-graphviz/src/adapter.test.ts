import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@ts-graphviz/adapter', () => ({
  toBlob: vi.fn().mockResolvedValue('blob'),
}));

import * as adapter from '@ts-graphviz/adapter';
import { toBlob } from './adapter.js';
import { digraph, toDot } from './ts-graphviz.js';

describe('ts-graphviz/adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes a DOT string through', async () => {
    await expect(toBlob('digraph {}', { format: 'svg' })).resolves.toBe('blob');
    expect(adapter.toBlob).toHaveBeenCalledWith('digraph {}', {
      format: 'svg',
    });
  });

  it('renders a model with toDot first', async () => {
    const g = digraph('G', (g) => {
      g.edge(['a', 'b']);
    });
    await expect(toBlob(g, { layout: 'neato' })).resolves.toBe('blob');
    expect(adapter.toBlob).toHaveBeenCalledWith(toDot(g), { layout: 'neato' });
  });
});
