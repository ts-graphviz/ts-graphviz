jest.mock('../utils');
jest.mock('../executeDot');
jest.mock('tmp-promise');

import { digraph } from 'ts-graphviz';
import { executeDot } from '../executeDot';
import { exportToFile } from '../exportToFile';

describe('exportToFile', () => {
  afterEach(() => {
    jest.clearAllMocks();
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
