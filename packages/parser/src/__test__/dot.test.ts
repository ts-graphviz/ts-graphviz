import { Digraph } from 'ts-graphviz';
import { dot } from '../dot';

describe('dot template tag', () => {
  test('simple digraph', () => {
    const G = dot`digraph {}`;
    expect(G).toBeInstanceOf(Digraph);
    expect(G.strict).toStrictEqual(false);
  });
});
