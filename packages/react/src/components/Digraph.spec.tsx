import { createRef } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';
import { describe, expect, test } from 'vitest';
import { render } from '../render.js';
import { Digraph } from './Digraph.js';
import { Node } from './Node.js';

describe('Digraph', () => {
  test('An error occurs when duplicate <Digraph />', async () => {
    // Duplicate Digraph components should throw an error
    await expect(
      render(
        <Digraph>
          <Digraph />
        </Digraph>,
      ),
    ).rejects.toThrow('No model was rendered');
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
