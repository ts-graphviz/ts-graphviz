jest.mock('../utils');
jest.mock('../executeDot');
jest.mock('tmp-promise');

import { digraph } from 'ts-graphviz';
import { exportToBuffer } from '../exportToBuffer';

describe('exportToBuffer', () => {
  afterEach(() => {
    jest.clearAllMocks();
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
