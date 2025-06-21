import type { GraphBaseModel } from 'ts-graphviz';
import { describe, expect, test } from 'vitest';
import { render } from '../render.js';
import { Digraph } from './Digraph.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';

describe('Subgraph', () => {
  describe('ref support', () => {
    test('should provide access to GraphBaseModel via ref', async () => {
      let subgraphRef: GraphBaseModel | null = null;

      const TestComponent = () => (
        <Digraph>
          <Subgraph
            id="testsubgraph"
            ref={(subgraph) => {
              subgraphRef = subgraph;
            }}
          >
            <Node id="A" />
          </Subgraph>
        </Digraph>
      );

      await render(<TestComponent />);

      expect(subgraphRef).not.toBeNull();
      if (subgraphRef) {
        expect((subgraphRef as GraphBaseModel).id).toBe('testsubgraph');
      }
    });
  });
});
