import { Graph } from './model/Cluster';
import { digraph, graph } from './usecase';

describe('function digraph', () => {
  it('should return Graph object, when excute digraph()', () => {
    const g = digraph();
    expect(g).toBeInstanceOf(Graph);
  });
});

describe('function graph', () => {
  it('should return Graph object, when excute graph()', () => {
    const g = graph();
    expect(g).toBeInstanceOf(Graph);
  });
});
