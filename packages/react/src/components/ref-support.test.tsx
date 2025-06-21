import { useRef } from 'react';
import type { EdgeModel, GraphBaseModel, NodeModel } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { render } from '../render.js';
import { Digraph } from './Digraph.js';
import { Edge } from './Edge.js';
import { Graph } from './Graph.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';

describe('React 19 Ref as Prop Support', () => {
  describe('Node ref support', () => {
    it('should provide access to NodeModel via ref', async () => {
      let nodeRef: NodeModel | null = null;

      const TestComponent = () => {
        const ref = useRef<NodeModel>(null);

        // Capture ref for testing
        setTimeout(() => {
          nodeRef = ref.current;
        }, 0);

        return (
          <Digraph>
            <Node id="testnode" ref={ref} label="Test Node" />
          </Digraph>
        );
      };

      await render(<TestComponent />);

      // Wait for ref to be set
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(nodeRef).not.toBeNull();
      expect(nodeRef!.id).toBe('testnode');
    });

    it('should work with function refs', async () => {
      let capturedNode: NodeModel | null = null;

      const TestComponent = () => (
        <Digraph>
          <Node
            id="functionref"
            ref={(node) => {
              capturedNode = node;
            }}
            label="Function Ref Node"
          />
        </Digraph>
      );

      await render(<TestComponent />);

      expect(capturedNode).not.toBeNull();
      expect(capturedNode!.id).toBe('functionref');
    });
  });

  describe('Edge ref support', () => {
    it('should provide access to EdgeModel via ref', async () => {
      let edgeRef: EdgeModel | null = null;

      const TestComponent = () => {
        const ref = useRef<EdgeModel>(null);

        // Capture ref for testing
        setTimeout(() => {
          edgeRef = ref.current;
        }, 0);

        return (
          <Digraph>
            <Node id="A" />
            <Node id="B" />
            <Edge targets={['A', 'B']} ref={ref} label="Test Edge" />
          </Digraph>
        );
      };

      await render(<TestComponent />);

      // Wait for ref to be set
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(edgeRef).not.toBeNull();
      // EdgeModel.targets contains NodeRef objects, not just strings
      expect(edgeRef!.targets).toHaveLength(2);
      expect(edgeRef!.targets[0]).toMatchObject({ id: 'A' });
      expect(edgeRef!.targets[1]).toMatchObject({ id: 'B' });
    });
  });

  describe('Graph ref support', () => {
    it('should provide access to GraphBaseModel via Digraph ref', async () => {
      let graphRef: GraphBaseModel | null = null;

      const TestComponent = () => {
        const ref = useRef<GraphBaseModel>(null);

        // Capture ref for testing
        setTimeout(() => {
          graphRef = ref.current;
        }, 0);

        return (
          <Digraph id="testgraph" ref={ref}>
            <Node id="A" />
          </Digraph>
        );
      };

      await render(<TestComponent />);

      // Wait for ref to be set
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(graphRef).not.toBeNull();
      // Digraph component creates a Graph model with directed=true
      expect(graphRef!.id).toBe('testgraph');
    });

    it('should provide access to GraphBaseModel via Subgraph ref', async () => {
      let subgraphRef: GraphBaseModel | null = null;

      const TestComponent = () => {
        const ref = useRef<GraphBaseModel>(null);

        // Capture ref for testing
        setTimeout(() => {
          subgraphRef = ref.current;
        }, 0);

        return (
          <Digraph>
            <Subgraph id="testsubgraph" ref={ref}>
              <Node id="A" />
            </Subgraph>
          </Digraph>
        );
      };

      await render(<TestComponent />);

      // Wait for ref to be set
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(subgraphRef).not.toBeNull();
      expect(subgraphRef!.id).toBe('testsubgraph');
    });

    it('should provide access to GraphBaseModel via Graph ref', async () => {
      let graphRef: GraphBaseModel | null = null;

      const TestComponent = () => {
        const ref = useRef<GraphBaseModel>(null);

        // Capture ref for testing
        setTimeout(() => {
          graphRef = ref.current;
        }, 0);

        return (
          <Graph id="testgraph" ref={ref}>
            <Node id="A" />
          </Graph>
        );
      };

      await render(<TestComponent />);

      // Wait for ref to be set
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(graphRef).not.toBeNull();
      // Graph component creates a Graph model with directed=false (undirected)
      expect(graphRef!.id).toBe('testgraph');
    });
  });

  describe('Multiple refs in complex graph', () => {
    it('should handle multiple refs correctly', async () => {
      let nodeRefA: NodeModel | null = null;
      let nodeRefB: NodeModel | null = null;
      let edgeRef: EdgeModel | null = null;
      let graphRef: GraphBaseModel | null = null;

      const TestComponent = () => {
        const nodeARef = useRef<NodeModel>(null);
        const nodeBRef = useRef<NodeModel>(null);
        const edgeABRef = useRef<EdgeModel>(null);
        const digraphRef = useRef<GraphBaseModel>(null);

        // Capture refs for testing
        setTimeout(() => {
          nodeRefA = nodeARef.current;
          nodeRefB = nodeBRef.current;
          edgeRef = edgeABRef.current;
          graphRef = digraphRef.current;
        }, 0);

        return (
          <Digraph id="complexgraph" ref={digraphRef}>
            <Node id="A" ref={nodeARef} label="Node A" />
            <Node id="B" ref={nodeBRef} label="Node B" />
            <Edge targets={['A', 'B']} ref={edgeABRef} label="Edge A->B" />
          </Digraph>
        );
      };

      await render(<TestComponent />);

      // Wait for refs to be set
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Verify all refs are set correctly
      expect(nodeRefA).not.toBeNull();
      expect(nodeRefA!.id).toBe('A');

      expect(nodeRefB).not.toBeNull();
      expect(nodeRefB!.id).toBe('B');

      expect(edgeRef).not.toBeNull();
      // EdgeModel.targets contains NodeRef objects, not just strings
      expect(edgeRef!.targets).toHaveLength(2);
      expect(edgeRef!.targets[0]).toMatchObject({ id: 'A' });
      expect(edgeRef!.targets[1]).toMatchObject({ id: 'B' });

      expect(graphRef).not.toBeNull();
      expect(graphRef!.id).toBe('complexgraph');
    });
  });

  describe('Ref with model manipulation', () => {
    it('should allow model manipulation via ref', async () => {
      let nodeRef: NodeModel | null = null;

      const TestComponent = () => {
        const ref = useRef<NodeModel>(null);

        // Capture ref for testing
        setTimeout(() => {
          nodeRef = ref.current;
        }, 0);

        return (
          <Digraph>
            <Node id="manipulatable" ref={ref} />
          </Digraph>
        );
      };

      const result = await render(<TestComponent />);

      // Wait for ref to be set
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(nodeRef).not.toBeNull();

      // Manipulate the node via ref
      if (nodeRef) {
        (nodeRef as unknown as NodeModel).attributes.set('color', 'red');
        (nodeRef as unknown as NodeModel).attributes.set('shape', 'box');
        (nodeRef as unknown as NodeModel).comment = 'Modified via ref';
      }

      // Verify changes were applied
      const targetNode = result.graph.nodes.find(
        (n) => n.id === 'manipulatable',
      );
      expect(targetNode?.attributes.get('color')).toBe('red');
      expect(targetNode?.attributes.get('shape')).toBe('box');
      expect(targetNode?.comment).toBe('Modified via ref');
    });
  });
});
