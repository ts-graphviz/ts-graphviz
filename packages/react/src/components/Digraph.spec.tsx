import { createRef } from 'react';
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
    expect(result.model).toBeDefined();
    expect(result.model.nodes.length).toBe(0);
    expect(result.model.edges.length).toBe(0);
    expect(result.model.subgraphs.length).toBe(0);
  });

  describe('ref support', () => {
    test('should provide access to GraphBaseModel via ref', async () => {
      const graphRef = createRef<GraphBaseModel>();

      await render(
        <Digraph id="testgraph" ref={graphRef}>
          <Node id="A" />
        </Digraph>,
      );

      expect(graphRef.current).not.toBeNull();
      expect(graphRef.current?.id).toBe('testgraph');
    });
  });
});
