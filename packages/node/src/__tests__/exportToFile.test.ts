import { describe, expect, test, vi, afterEach } from 'vitest';
import { digraph } from 'ts-graphviz';
import { executeDot } from '../executeDot.js';
import { exportToFile } from '../exportToFile.js';

vi.mock('../utils');
vi.mock('../executeDot');
vi.mock('tmp-promise');

describe('exportToFile', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  test('input can be given as string type', async () => {
    const dot = 'digraph g { a -> b; }';
    await exportToFile(dot, {
      format: 'json',
      output: 'sample.json',
    });
    expect(executeDot).toBeCalledWith(dot, {
      format: 'json',
      output: 'sample.json',
    });
  });

  test('input can be given as RootCluster type', async () => {
    const dot = digraph('g', (g) => {
      g.edge(['a', 'b']);
    });
    await exportToFile(dot, {
      format: 'svg',
      output: 'sample.svg',
    });
    expect(executeDot).toBeCalledWith(
      `digraph "g" {
  "a" -> "b";
}`,
      {
        format: 'svg',
        output: 'sample.svg',
      },
    );
  });
});
