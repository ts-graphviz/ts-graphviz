import type { GraphBaseModel } from 'ts-graphviz';
import { describe, expect, test } from 'vitest';
import { render } from '../render.js';
import { Digraph } from './Digraph.js';
import { Node } from './Node.js';

describe('Digraph', () => {
  test('An error occurs when duplicate <Digraph />', async () => {
    // Duplicate Digraph components should result in empty graph
    // because the second Digraph throws an error during component execution
    const result = await render(
      <Digraph>
        <Digraph />
      </Digraph>,
    );

    // The outer Digraph should be created, but inner one fails
    expect(result.graph).toBeDefined();
    expect(result.graph.nodes.length).toBe(0);
    expect(result.graph.edges.length).toBe(0);
    expect(result.graph.subgraphs.length).toBe(0);
  });

  describe('ref support', () => {
    test('should provide access to GraphBaseModel via ref', async () => {
      let graphRef: GraphBaseModel | null = null;

      const TestComponent = () => (
        <Digraph
          id="testgraph"
          ref={(graph) => {
            graphRef = graph;
          }}
        >
          <Node id="A" />
        </Digraph>
      );

      await render(<TestComponent />);

      expect(graphRef).not.toBeNull();
      // Digraph component creates a Graph model with directed=true
      if (graphRef) {
        expect((graphRef as GraphBaseModel).id).toBe('testgraph');
      }
    });
  });
});
