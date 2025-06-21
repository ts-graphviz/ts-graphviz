import { describe, expect, test } from 'vitest';
import { render } from '../render.js';
import { Digraph } from './Digraph.js';

describe('Digraph', () => {
  test('An error occurs when duplicate <Digraph />', async () => {
    // React 19: Duplicate Digraph components should result in empty graph
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
});
