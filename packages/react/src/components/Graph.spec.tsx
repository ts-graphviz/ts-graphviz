import { createRef } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';
import { describe, expect, test } from 'vitest';
import { render } from '../render.js';
import { Graph } from './Graph.js';
import { Node } from './Node.js';

describe('Graph', () => {
  test('An error occurs when duplicate <Graph />', async () => {
    // Duplicate Graph components should throw an error
    await expect(
      render(
        <Graph>
          <Graph />
        </Graph>,
      ),
    ).rejects.toThrow('No model was rendered');
  });

  describe('ref support', () => {
    test('should provide access to GraphBaseModel via ref', async () => {
      const graphRef = createRef<GraphBaseModel>();

      await render(
        <Graph id="testgraph" ref={graphRef}>
          <Node id="A" />
        </Graph>,
      );

      expect(graphRef.current).not.toBeNull();
      expect(graphRef.current?.id).toBe('testgraph');
    });
  });
});
