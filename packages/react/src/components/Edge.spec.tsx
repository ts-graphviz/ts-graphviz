import type { EdgeModel, RootGraphModel } from 'ts-graphviz';
import { describe, expect, test } from 'vitest';
import { render } from '../render.js';
import { Digraph } from './Digraph.js';
import { Edge } from './Edge.js';
import { Node } from './Node.js';

describe('Edge', () => {
  describe('ref support', () => {
    test('should provide access to EdgeModel via ref', async () => {
      let edgeRef: EdgeModel | null = null;

      const TestComponent = () => (
        <Digraph>
          <Node id="A" />
          <Node id="B" />
          <Edge
            targets={['A', 'B']}
            ref={(edge) => {
              edgeRef = edge;
            }}
            label="Test Edge"
          />
        </Digraph>
      );

      await render<RootGraphModel>(<TestComponent />);

      expect(edgeRef).not.toBeNull();
      // EdgeModel.targets contains NodeRef objects, not just strings
      if (edgeRef) {
        expect((edgeRef as EdgeModel).targets).toHaveLength(2);
        expect((edgeRef as EdgeModel).targets[0]).toMatchObject({ id: 'A' });
        expect((edgeRef as EdgeModel).targets[1]).toMatchObject({ id: 'B' });
      }
    });
  });
});
