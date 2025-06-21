import { describe, expect, test } from 'vitest';
import { render } from '../render.js';
import { Graph } from './Graph.js';

describe('Graph', () => {
  test('An error occurs when duplicate <Graph />', async () => {
    // React 19: Duplicate Graph components should result in empty graph
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
});
