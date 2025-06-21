import type { EdgeModel, GraphBaseModel, NodeModel } from 'ts-graphviz';
import { describe, expect, test } from 'vitest';
import { render } from '../render.js';
import { Digraph } from './Digraph.js';
import { Edge } from './Edge.js';
import { Node } from './Node.js';

describe('Component Refs Integration', () => {
  test('should handle multiple refs correctly in complex graph', async () => {
    let nodeRefA: NodeModel | null = null;
    let nodeRefB: NodeModel | null = null;
    let edgeRef: EdgeModel | null = null;
    let graphRef: GraphBaseModel | null = null;

    const TestComponent = () => (
      <Digraph
        id="complexgraph"
        ref={(graph) => {
          graphRef = graph;
        }}
      >
        <Node
          id="A"
          ref={(node) => {
            nodeRefA = node;
          }}
          label="Node A"
        />
        <Node
          id="B"
          ref={(node) => {
            nodeRefB = node;
          }}
          label="Node B"
        />
        <Edge
          targets={['A', 'B']}
          ref={(edge) => {
            edgeRef = edge;
          }}
          label="Edge A->B"
        />
      </Digraph>
    );

    await render(<TestComponent />);

    // Verify all refs are set correctly
    expect(nodeRefA).not.toBeNull();
    if (nodeRefA) {
      expect((nodeRefA as NodeModel).id).toBe('A');
    }

    expect(nodeRefB).not.toBeNull();
    if (nodeRefB) {
      expect((nodeRefB as NodeModel).id).toBe('B');
    }

    expect(edgeRef).not.toBeNull();
    // EdgeModel.targets contains NodeRef objects, not just strings
    if (edgeRef) {
      expect((edgeRef as EdgeModel).targets).toHaveLength(2);
      expect((edgeRef as EdgeModel).targets[0]).toMatchObject({ id: 'A' });
      expect((edgeRef as EdgeModel).targets[1]).toMatchObject({ id: 'B' });
    }

    expect(graphRef).not.toBeNull();
    if (graphRef) {
      expect((graphRef as GraphBaseModel).id).toBe('complexgraph');
    }
  });
});
