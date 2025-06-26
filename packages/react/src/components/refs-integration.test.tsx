import type { EdgeModel, GraphBaseModel, NodeModel } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { render } from '../render.js';
import {
  expectEdge,
  expectGraph,
  expectNode,
} from '../test-utils/assertions.js';
import { Digraph } from './Digraph.js';
import { Edge } from './Edge.js';
import { Node } from './Node.js';
import '../types.js';

// Helper functions to safely assert and cast refs
function assertNodeRef(ref: NodeModel | null): NodeModel {
  expect(ref).not.toBeNull();
  if (!ref) {
    throw new Error('Node ref is null');
  }
  expectNode(ref);
  return ref;
}

function assertEdgeRef(ref: EdgeModel | null): EdgeModel {
  expect(ref).not.toBeNull();
  if (!ref) {
    throw new Error('Edge ref is null');
  }
  expectEdge(ref);
  return ref;
}

function assertGraphRef(ref: GraphBaseModel | null): GraphBaseModel {
  expect(ref).not.toBeNull();
  if (!ref) {
    throw new Error('Graph ref is null');
  }
  expectGraph(ref);
  return ref;
}

describe('React Refs Integration', () => {
  describe('Component Reference Handling', () => {
    it('provides correct refs for all component types in complex graph', async () => {
      // Create ref containers using a more organized approach
      const refs = {
        nodeA: null as NodeModel | null,
        nodeB: null as NodeModel | null,
        edge: null as EdgeModel | null,
        graph: null as GraphBaseModel | null,
      };

      const ComplexGraphWithRefs = () => (
        <Digraph
          id="complexgraph"
          ref={(graph) => {
            refs.graph = graph;
          }}
        >
          <Node
            id="A"
            ref={(node) => {
              refs.nodeA = node;
            }}
            label="Node A"
          />
          <Node
            id="B"
            ref={(node) => {
              refs.nodeB = node;
            }}
            label="Node B"
          />
          <Edge
            targets={['A', 'B']}
            ref={(edge) => {
              refs.edge = edge;
            }}
            label="Edge A->B"
          />
        </Digraph>
      );

      await render(<ComplexGraphWithRefs />);

      // Verify and validate all refs with type safety
      const nodeA = assertNodeRef(refs.nodeA);
      const nodeB = assertNodeRef(refs.nodeB);
      const edge = assertEdgeRef(refs.edge);
      const graph = assertGraphRef(refs.graph);

      // Validate node A properties
      expect(nodeA.id).toBe('A');
      expect(nodeA.attributes.get('label')).toBe('Node A');

      // Validate node B properties
      expect(nodeB.id).toBe('B');
      expect(nodeB.attributes.get('label')).toBe('Node B');

      // Validate edge properties
      expect(edge.targets).toHaveLength(2);
      expect(edge.targets[0]).toMatchObject({ id: 'A' });
      expect(edge.targets[1]).toMatchObject({ id: 'B' });
      expect(edge.attributes.get('label')).toBe('Edge A->B');

      // Validate graph properties
      expect(graph.id).toBe('complexgraph');
    });

    it('handles refs with function components and maintains ref consistency', async () => {
      const refs = {
        node: null as NodeModel | null,
        graph: null as GraphBaseModel | null,
      };

      const FunctionComponentWithRefs = () => (
        <Digraph
          id="functional"
          ref={(graph) => {
            refs.graph = graph;
          }}
        >
          <Node
            id="func_node"
            ref={(node) => {
              refs.node = node;
            }}
            shape="circle"
          />
        </Digraph>
      );

      await render(<FunctionComponentWithRefs />);

      // Validate refs with improved type safety
      const node = assertNodeRef(refs.node);
      const graph = assertGraphRef(refs.graph);

      expect(node.id).toBe('func_node');
      expect(node.attributes.get('shape')).toBe('circle');
      expect(graph.id).toBe('functional');
    });

    it('handles conditional ref assignment correctly', async () => {
      let nodeRef: NodeModel | null = null;
      let refCallCount = 0;

      const ConditionalRefComponent = ({
        shouldSetRef,
      }: {
        shouldSetRef: boolean;
      }) => (
        <Digraph id="conditional">
          <Node
            id="conditional_node"
            ref={
              shouldSetRef
                ? (node) => {
                    nodeRef = node;
                    refCallCount++;
                  }
                : undefined
            }
          />
        </Digraph>
      );

      // Test with ref enabled
      await render(<ConditionalRefComponent shouldSetRef={true} />);

      const node = assertNodeRef(nodeRef);
      expect(node.id).toBe('conditional_node');
      expect(refCallCount).toBe(1);

      // Test with ref disabled
      nodeRef = null;
      refCallCount = 0;
      await render(<ConditionalRefComponent shouldSetRef={false} />);

      expect(nodeRef).toBeNull();
      expect(refCallCount).toBe(0);
    });

    it('maintains ref integrity across multiple render cycles', async () => {
      const refHistory: { nodeId: string; node: NodeModel }[] = [];

      const MultipleRenderComponent = ({ suffix }: { suffix: string }) => (
        <Digraph id={`multi_${suffix}`}>
          <Node
            id={`node_${suffix}`}
            ref={(node) => {
              if (node) {
                // Validate the ref before storing
                expectNode(node);
                refHistory.push({ nodeId: node.id, node });
              }
            }}
          />
        </Digraph>
      );

      // Render multiple components and verify ref consistency
      const testCases = ['first', 'second', 'third'];

      for (const suffix of testCases) {
        await render(<MultipleRenderComponent suffix={suffix} />);
      }

      expect(refHistory).toHaveLength(testCases.length);

      // Verify each ref corresponds to the correct component
      testCases.forEach((suffix, index) => {
        const refEntry = refHistory[index];
        expect(refEntry.nodeId).toBe(`node_${suffix}`);
        expect(refEntry.node.id).toBe(`node_${suffix}`);
        expectNode(refEntry.node);
      });
    });

    it('handles ref updates when components re-render', async () => {
      let currentRef: NodeModel | null = null;
      let refSetCount = 0;

      const RefUpdateComponent = ({ nodeId }: { nodeId: string }) => (
        <Digraph id={`update_${nodeId}`}>
          <Node
            id={nodeId}
            ref={(node) => {
              currentRef = node;
              if (node) {
                refSetCount++;
              }
            }}
          />
        </Digraph>
      );

      // Render first component
      await render(<RefUpdateComponent nodeId="test1" />);

      const node1 = assertNodeRef(currentRef);
      expect(node1.id).toBe('test1');
      expect(refSetCount).toBe(1);

      // Store reference to first node for comparison
      const firstNodeRef = node1;

      // Render second component (should update ref)
      await render(<RefUpdateComponent nodeId="test2" />);

      const node2 = assertNodeRef(currentRef);
      expect(node2.id).toBe('test2');
      expect(refSetCount).toBe(2);

      // Verify the refs are different instances
      expect(firstNodeRef).not.toBe(node2);
    });
  });
});
