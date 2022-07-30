import { describe, expect, test, vi, afterEach } from 'vitest';
import { digraph } from 'ts-graphviz';
import { exportToBuffer } from '../exportToBuffer.js';

vi.mock('../utils');
vi.mock('../executeDot');
vi.mock('tmp-promise');

describe('exportToBuffer', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  test('input can be given as string type', async () => {
    const dot = 'digraph g { a -> b; }';
    const result = await exportToBuffer(dot);
    expect(result.toString()).toMatchSnapshot();
  });

  test('input can be given as RootCluster type', async () => {
    const dot = digraph('g', (g) => {
      g.edge(['a', 'b']);
    });
    const result = await exportToBuffer(dot);
    expect(result.toString()).toMatchSnapshot();
  });
});
