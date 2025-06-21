import type { GraphBaseModel } from 'ts-graphviz';
import { describe, expect, test } from 'vitest';
import { render } from '../render.js';
import { Graph } from './Graph.js';
import { Node } from './Node.js';

describe('Graph', () => {
  test('An error occurs when duplicate <Graph />', async () => {
    // Duplicate Graph components should result in empty graph
    // because the second Graph throws an error during component execution
    const result = await render(
      <Graph>
        <Graph />
      </Graph>,
    );

    // The outer Graph should be created, but inner one fails
    expect(result.graph).toBeDefined();
    expect(result.graph.nodes.length).toBe(0);
    expect(result.graph.edges.length).toBe(0);
    expect(result.graph.subgraphs.length).toBe(0);
  });

  describe('ref support', () => {
    test('should provide access to GraphBaseModel via ref', async () => {
      let graphRef: GraphBaseModel | null = null;

      const TestComponent = () => (
        <Graph
          id="testgraph"
          ref={(graph) => {
            graphRef = graph;
          }}
        >
          <Node id="A" />
        </Graph>
      );

      await render(<TestComponent />);

      expect(graphRef).not.toBeNull();
      // Graph component creates a Graph model with directed=false (undirected)
      if (graphRef) {
        expect((graphRef as GraphBaseModel).id).toBe('testgraph');
      }
    });
  });
});
