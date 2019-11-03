import { Digraph, Graph } from './model/dot';
import { digraph, graph } from './usecase';

describe('function digraph', () => {
  it('should return Digraph object, when execute digraph()', () => {
    const g = digraph();
    expect(g).toBeInstanceOf(Digraph);
  });
});

describe('function graph', () => {
  it('should return Graph object, when execute graph()', () => {
    const g = graph();
    expect(g).toBeInstanceOf(Graph);
  });
});
