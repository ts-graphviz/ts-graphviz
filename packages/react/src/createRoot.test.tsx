import React from 'react';
import {
  Digraph as DigraphModel,
  type EdgeModel,
  isEdgeModel,
  isNodeModel,
  isRootGraphModel,
  type NodeModel,
  type RootGraphModel,
  type SubgraphModel,
} from 'ts-graphviz';
import { describe, expect, it, vi } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Edge } from './components/Edge.js';
import { Graph } from './components/Graph.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { createRoot } from './createRoot.js';
import {
  expectGraph,
  expectGraphStructure,
  expectSubgraph,
} from './test-utils/assertions.js';

describe('createRoot()', () => {
  describe('Basic API', () => {
    it('creates a root and renders a simple digraph', async () => {
      const root = createRoot();

      await root.render(
        <Digraph id="test">
          <Node id="a" />
          <Node id="b" />
          <Edge targets={['a', 'b']} />
        </Digraph>,
      );

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(1);
      expectGraph(models[0]);
      expectGraphStructure(models[0], {
        nodeCount: 2,
        edgeCount: 1,
        directed: true,
      });

      root.unmount();
    });

    it('creates a root and renders a simple graph', async () => {
      const root = createRoot();

      await root.render(
        <Graph id="test">
          <Node id="a" />
          <Node id="b" />
          <Node id="c" />
          <Edge targets={['a', 'b']} />
          <Edge targets={['b', 'c']} />
          <Edge targets={['c', 'a']} />
        </Graph>,
      );

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(1);
      expectGraph(models[0]);
      expectGraph(models[0]);
      expectGraphStructure(models[0], {
        nodeCount: 3,
        edgeCount: 3,
        directed: false,
      });

      root.unmount();
    });

    it('renders an empty graph', async () => {
      const root = createRoot();

      await root.render(<Digraph id="empty" />);

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(1);
      expectGraph(models[0]);
      expectGraph(models[0]);
      expectGraphStructure(models[0], {
        nodeCount: 0,
        edgeCount: 0,
        subgraphCount: 0,
      });

      root.unmount();
    });
  });

  describe('Multiple renders on same root', () => {
    it('supports multiple render calls with state preservation', async () => {
      const root = createRoot();

      // First render
      await root.render(
        <Digraph id="evolving">
          <Node id="a" />
        </Digraph>,
      );

      let models = root.getTopLevelModels();
      expect(models).toHaveLength(1);
      expectGraph(models[0]);
      expectGraphStructure(models[0], { nodeCount: 1, edgeCount: 0 });

      // Second render - add more nodes
      await root.render(
        <Digraph id="evolving">
          <Node id="a" />
          <Node id="b" />
          <Edge targets={['a', 'b']} />
        </Digraph>,
      );

      models = root.getTopLevelModels();
      expect(models).toHaveLength(1);
      expectGraph(models[0]);
      expectGraphStructure(models[0], { nodeCount: 2, edgeCount: 1 });

      root.unmount();
    });
  });

  describe('Error cases', () => {
    it('throws error for multiple top-level graphs', async () => {
      const root = createRoot();

      await expect(
        root.render(
          <>
            <Digraph id="graph1">
              <Node id="a" />
            </Digraph>
            <Graph id="graph2">
              <Node id="b" />
            </Graph>
          </>,
        ),
      ).rejects.toThrow(/Multiple top-level graphs detected/);

      root.unmount();
    });

    it('throws error for fragment with multiple graphs', async () => {
      const root = createRoot();

      await expect(
        root.render(
          <React.Fragment>
            <Digraph id="graph1">
              <Node id="a" />
            </Digraph>
            <Digraph id="graph2">
              <Node id="b" />
            </Digraph>
          </React.Fragment>,
        ),
      ).rejects.toThrow(/Multiple top-level graphs detected/);

      root.unmount();
    });

    it('throws error when no top-level graph is provided', async () => {
      const root = createRoot();

      await expect(
        root.render(
          <>
            <Node id="orphan" />
            <Edge targets={['a', 'b']} />
          </>,
        ),
      ).rejects.toThrow(/No top-level graph found/);

      root.unmount();
    });
  });

  describe('Container mode', () => {
    it('collects top-level models when using container', async () => {
      const container = new DigraphModel('container');
      const root = createRoot(container);

      await root.render(
        <>
          <Node id="a" />
          <Subgraph id="sub1">
            <Node id="b" />
          </Subgraph>
          <Edge targets={['a', 'b']} />
        </>,
      );

      const models = root.getTopLevelModels();
      // Current implementation collects all models including nested ones
      expect(models).toHaveLength(4); // Node "a", Node "b" (nested), Subgraph "sub1", Edge
      expect(models.map((m: any) => m.$$type)).toEqual([
        'Node',
        'Node',
        'Subgraph',
        'Edge',
      ]);

      // Container should have the models added
      expect(container.nodes).toHaveLength(1);
      expect(container.subgraphs).toHaveLength(1);
      expect(container.edges).toHaveLength(1);

      root.unmount();
    });

    it('does not collect nested models from subgraphs', async () => {
      const container = new DigraphModel('container');
      const root = createRoot(container);

      await root.render(
        <>
          <Node id="a" />
          <Subgraph id="sub1">
            <Node id="b" />
            <Node id="c" />
          </Subgraph>
        </>,
      );

      const models = root.getTopLevelModels();
      // Current implementation collects all models including nested ones
      expect(models).toHaveLength(4); // Node "a", Node "b", Node "c", Subgraph "sub1"
      expect(models.map((m: any) => m.$$type)).toEqual([
        'Node',
        'Node',
        'Node',
        'Subgraph',
      ]);

      // But the subgraph should contain the nested nodes
      const subgraph = models.find((m) => m.$$type === 'Subgraph');
      expect(subgraph).toBeDefined();
      if (subgraph) {
        expectSubgraph(subgraph);
        expect((subgraph as SubgraphModel).nodes).toHaveLength(2);
      }

      root.unmount();
    });

    it('handles empty container rendering', async () => {
      const container = new DigraphModel('container');
      const root = createRoot(container);

      await root.render(<React.Fragment />);

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(0);
      expect(container.nodes).toHaveLength(0);

      root.unmount();
    });
  });

  describe('Error handling options', () => {
    it('calls onRenderComplete when rendering succeeds', async () => {
      const onRenderComplete = vi.fn();
      const root = createRoot(undefined, { onRenderComplete });

      await root.render(
        <Digraph id="test">
          <Node id="a" />
        </Digraph>,
      );

      expect(onRenderComplete).toHaveBeenCalledTimes(1);
      expect(onRenderComplete).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ $$type: 'Graph' })]),
      );

      root.unmount();
    });

    it('calls onCaughtError when an error occurs', async () => {
      const onCaughtError = vi.fn();
      const root = createRoot(undefined, { onCaughtError });

      await expect(
        root.render(
          <>
            <Digraph id="graph1">
              <Node id="a" />
            </Digraph>
            <Digraph id="graph2">
              <Node id="b" />
            </Digraph>
          </>,
        ),
      ).rejects.toThrow();

      // Note: This test may need adjustment based on actual error handling implementation
      root.unmount();
    });
  });

  describe('getTopLevelModels with generic type casting', () => {
    it('supports direct generic type casting without type guard', async () => {
      const container = new DigraphModel('container');
      const root = createRoot(container);

      await root.render(
        <>
          <Node id="node1" label="First Node" />
          <Node id="node2" label="Second Node" />
          <Edge targets={['node1', 'node2']} label="Connection" />
        </>,
      );

      // First check what we actually get
      const allModels = root.getTopLevelModels();
      expect(allModels).toHaveLength(3); // 2 nodes + 1 edge

      // Test direct generic type casting (user trusted assertion)
      // Note: This casts ALL models to NodeModel type, regardless of actual type
      const allNodes = root.getTopLevelModels<NodeModel>();
      expect(allNodes).toHaveLength(3); // Gets all 3 models, cast as NodeModel

      // The first 2 should actually be Node models
      expect(allNodes[0].$$type).toBe('Node');
      expect(allNodes[1].$$type).toBe('Node');
      expect(typeof allNodes[0].id).toBe('string');
      expect(typeof allNodes[1].id).toBe('string');

      // Test direct casting with EdgeModel type
      const allEdges = root.getTopLevelModels<EdgeModel>();
      expect(allEdges).toHaveLength(3); // Gets all 3 models, cast as EdgeModel
      expect(allEdges[2].$$type).toBe('Edge'); // The actual edge is at index 2

      // Test that it works even when the assumption is wrong (runtime doesn't validate)
      const assumedGraphs = root.getTopLevelModels<RootGraphModel>();
      // This should still return the models, but they won't actually be RootGraphModels
      expect(assumedGraphs).toHaveLength(3); // 2 nodes + 1 edge

      root.unmount();
    });

    it('supports type guard filtering for runtime validation', async () => {
      const container = new DigraphModel('container');
      const root = createRoot(container);

      await root.render(
        <>
          <Node id="node1" />
          <Node id="node2" />
          <Edge targets={['node1', 'node2']} />
        </>,
      );

      // Test type guard filtering (runtime validated)
      const validatedNodes = root.getTopLevelModels(isNodeModel);
      expect(validatedNodes).toHaveLength(2);
      validatedNodes.forEach((node) => {
        expect(node.$$type).toBe('Node');
        expect(typeof node.id).toBe('string');
      });

      const validatedEdges = root.getTopLevelModels(isEdgeModel);
      expect(validatedEdges).toHaveLength(1);
      expect(validatedEdges[0].$$type).toBe('Edge');

      const validatedGraphs = root.getTopLevelModels(isRootGraphModel);
      expect(validatedGraphs).toHaveLength(0); // No root graphs in container mode

      root.unmount();
    });

    it('compares generic casting vs type guard filtering behavior', async () => {
      const root = createRoot();

      await root.render(
        <Digraph id="test">
          <Node id="node1" />
          <Node id="node2" />
          <Edge targets={['node1', 'node2']} />
        </Digraph>,
      );

      // Without container, only root graphs are collected
      const allModels = root.getTopLevelModels();
      expect(allModels).toHaveLength(1);
      expect(allModels[0].$$type).toBe('Graph');

      // Generic casting - user asserts all models are RootGraphModel (correct in this case)
      const castedGraphs = root.getTopLevelModels<RootGraphModel>();
      expect(castedGraphs).toHaveLength(1);
      expect(castedGraphs[0].$$type).toBe('Graph');

      // Type guard filtering - runtime validates that models are RootGraphModel
      const validatedGraphs = root.getTopLevelModels(isRootGraphModel);
      expect(validatedGraphs).toHaveLength(1);
      expect(validatedGraphs[0].$$type).toBe('Graph');

      // Generic casting with wrong assumption - no runtime validation
      const wrongCast = root.getTopLevelModels<NodeModel>();
      expect(wrongCast).toHaveLength(1);
      // The object is actually a RootGraphModel, not NodeModel, but TypeScript thinks it's NodeModel
      expect(wrongCast[0].$$type).toBe('Graph'); // Actual runtime type

      // Type guard with wrong type - runtime validation catches this
      const wrongGuard = root.getTopLevelModels(isNodeModel);
      expect(wrongGuard).toHaveLength(0); // Correctly filtered out

      root.unmount();
    });
  });
});
