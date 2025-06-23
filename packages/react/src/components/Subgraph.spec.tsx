import { createRef } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';
import { describe, expect, test } from 'vitest';
import { render } from '../render.js';
import { Digraph } from './Digraph.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';

describe('Subgraph', () => {
  describe('ref support', () => {
    test('should provide access to GraphBaseModel via ref', async () => {
      const subgraphRef = createRef<GraphBaseModel>();

      await render(
        <Digraph>
          <Subgraph id="testsubgraph" ref={subgraphRef}>
            <Node id="A" />
          </Subgraph>
        </Digraph>,
      );

      expect(subgraphRef.current).not.toBeNull();
      expect(subgraphRef.current?.id).toBe('testsubgraph');
    });
  });
});
