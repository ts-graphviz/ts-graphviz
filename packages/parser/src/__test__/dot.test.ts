import { Graph } from '@ts-graphviz/model';
import { dot } from '../dot';

describe('dot template tag', () => {
  test('simple digraph', () => {
    const G = dot`digraph {}`;
    expect(G).toBeInstanceOf(Graph);
    expect(G.strict).toStrictEqual(false);
    expect(G.directed).toStrictEqual(true);
  });
});
