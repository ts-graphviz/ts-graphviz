import React from 'react';
import { describe, expect, it } from 'vitest';
import { CurrentGraph } from '../contexts/CurrentGraph.js';
import { createRoot } from '../createRoot.js';
import { renderToDot } from '../renderToDot.js';
import { Digraph } from './Digraph.js';
import { Edge } from './Edge.js';
import { GraphPortal } from './GraphPortal.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';

describe('GraphPortal', () => {
  describe('Display Name', () => {
    it('has the correct display name', () => {
      expect(GraphPortal.displayName).toBe('GraphPortal');
    });
  });

  describe('Basic Rendering', () => {
    it('renders children without id prop', async () => {
      const root = createRoot();

      await root.render(
        <Digraph id="test">
          <GraphPortal>
            <Node id="a" />
            <Node id="b" />
          </GraphPortal>
        </Digraph>,
      );

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(1);

      const graph = models[0];
      expect(graph.$$type).toBe('Graph');

      if (graph.$$type === 'Graph') {
        const nodes = Array.from(graph.nodes.values());
        expect(nodes).toHaveLength(2);
        expect(nodes.some((node) => node.id === 'a')).toBe(true);
        expect(nodes.some((node) => node.id === 'b')).toBe(true);
      }

      root.unmount();
    });

    it('renders children with nested structure', async () => {
      const root = createRoot();

      await root.render(
        <Digraph id="test">
          <GraphPortal>
            <Node id="outer" />
            <Subgraph id="cluster_inner">
              <Node id="inner" />
            </Subgraph>
          </GraphPortal>
        </Digraph>,
      );

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(1);

      const graph = models[0];
      expect(graph.$$type).toBe('Graph');

      if (graph.$$type === 'Graph') {
        const nodes = Array.from(graph.nodes.values());
        expect(nodes.some((node) => node.id === 'outer')).toBe(true);

        const subgraphs = Array.from(graph.subgraphs.values());
        expect(subgraphs).toHaveLength(1);
        expect(subgraphs[0].id).toBe('cluster_inner');
      }

      root.unmount();
    });

    it('renders empty portal', async () => {
      const root = createRoot();

      await root.render(
        <Digraph id="test">
          <GraphPortal />
        </Digraph>,
      );

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(1);

      const graph = models[0];
      expect(graph.$$type).toBe('Graph');

      root.unmount();
    });
  });

  describe('Prop Handling with id', () => {
    it('targets specific subgraph when id prop is provided and portal is inside that subgraph', async () => {
      const dot = await renderToDot(
        <Digraph id="test">
          <Node id="outside" />
          <Subgraph id="cluster_target">
            <Node id="original" />
            <GraphPortal id="cluster_target">
              <Node id="portaled" />
            </GraphPortal>
          </Subgraph>
        </Digraph>,
      );

      // Verify both nodes are in the cluster
      expect(dot).toContain('subgraph "cluster_target"');
      expect(dot).toContain('"original"');
      expect(dot).toContain('"portaled"');
      expect(dot).toContain('"outside"');
    });

    it('falls back to container when id does not exist in map', async () => {
      const root = createRoot();

      await root.render(
        <Digraph id="test">
          <Node id="a" />
          <GraphPortal id="nonexistent">
            <Node id="b" />
          </GraphPortal>
        </Digraph>,
      );

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(1);

      const graph = models[0];
      if (graph.$$type === 'Graph') {
        const nodes = Array.from(graph.nodes.values());
        expect(nodes).toHaveLength(2);
        expect(nodes.some((node) => node.id === 'a')).toBe(true);
        expect(nodes.some((node) => node.id === 'b')).toBe(true);
      }

      root.unmount();
    });

    it('handles multiple portals targeting the same subgraph', async () => {
      const dot = await renderToDot(
        <Digraph id="test">
          <Subgraph id="cluster_shared">
            <Node id="original" />
            <GraphPortal id="cluster_shared">
              <Node id="portal1" />
            </GraphPortal>
            <GraphPortal id="cluster_shared">
              <Node id="portal2" />
            </GraphPortal>
          </Subgraph>
        </Digraph>,
      );

      expect(dot).toContain('subgraph "cluster_shared"');
      expect(dot).toContain('"original"');
      expect(dot).toContain('"portal1"');
      expect(dot).toContain('"portal2"');
    });

    it('allows nodes to be added to nested subgraphs via portal', async () => {
      const dot = await renderToDot(
        <Digraph id="test">
          <Subgraph id="cluster_outer">
            <Node id="outer_node" />
            <Subgraph id="cluster_inner">
              <Node id="inner_node" />
              <GraphPortal id="cluster_inner">
                <Node id="portaled_inner" />
              </GraphPortal>
            </Subgraph>
          </Subgraph>
        </Digraph>,
      );

      expect(dot).toContain('subgraph "cluster_outer"');
      expect(dot).toContain('subgraph "cluster_inner"');
      expect(dot).toContain('"outer_node"');
      expect(dot).toContain('"inner_node"');
      expect(dot).toContain('"portaled_inner"');
    });
  });

  describe('Context Provider Behavior', () => {
    it('provides CurrentGraph context to children', async () => {
      const root = createRoot();
      let contextValue: any;

      const ContextReader = () => {
        const context = React.useContext(CurrentGraph);
        contextValue = context;
        return <Node id="test" />;
      };

      await root.render(
        <Digraph id="test">
          <GraphPortal>
            <ContextReader />
          </GraphPortal>
        </Digraph>,
      );

      expect(contextValue).not.toBeNull();
      expect(contextValue).toBeDefined();

      root.unmount();
    });

    it('provides context for portal children', async () => {
      const root = createRoot();
      let portalContextValue: any;

      const PortalContextReader = () => {
        const context = React.useContext(CurrentGraph);
        portalContextValue = context;
        return <Node id="portal_node" />;
      };

      await root.render(
        <Digraph id="test">
          <Subgraph id="cluster_a">
            <Node id="cluster_node" />
            <GraphPortal id="cluster_a">
              <PortalContextReader />
            </GraphPortal>
          </Subgraph>
        </Digraph>,
      );

      // Portal should provide a valid graph context
      expect(portalContextValue).toBeDefined();
      expect(portalContextValue).not.toBeNull();
      // The context should have an id
      expect(portalContextValue.id).toBeDefined();

      root.unmount();
    });

    it('allows cross-subgraph edges using portals', async () => {
      const dot = await renderToDot(
        <Digraph id="test">
          <Subgraph id="cluster_a">
            <Node id="a1" />
          </Subgraph>
          <Subgraph id="cluster_b">
            <Node id="b1" />
            <GraphPortal id="cluster_a">
              <Edge targets={['a1', 'b1']} />
            </GraphPortal>
          </Subgraph>
        </Digraph>,
      );

      expect(dot).toContain('"a1"');
      expect(dot).toContain('"b1"');
      expect(dot).toContain('"a1" -> "b1"');
    });
  });

  describe('Integration with GraphContainer and GraphMap', () => {
    it('uses GraphContainer context when available', async () => {
      const root = createRoot();

      await root.render(
        <Digraph id="test">
          <GraphPortal>
            <Node id="from_container" />
          </GraphPortal>
        </Digraph>,
      );

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(1);

      const graph = models[0];
      if (graph.$$type === 'Graph') {
        const nodes = Array.from(graph.nodes.values());
        expect(nodes.some((node) => node.id === 'from_container')).toBe(true);
      }

      root.unmount();
    });

    it('uses GraphMap context to resolve id within same subgraph tree', async () => {
      const dot = await renderToDot(
        <Digraph id="test">
          <Subgraph id="cluster_mapped">
            <Node id="original_mapped" />
            <GraphPortal id="cluster_mapped">
              <Node id="via_map" />
            </GraphPortal>
          </Subgraph>
        </Digraph>,
      );

      expect(dot).toContain('subgraph "cluster_mapped"');
      expect(dot).toContain('"original_mapped"');
      expect(dot).toContain('"via_map"');
    });
  });

  describe('Edge Cases', () => {
    it('handles portal with only text children', async () => {
      const root = createRoot();

      await root.render(
        <Digraph id="test">
          <GraphPortal>
            <Node id="before_text" />
            {/* Text children should be ignored */}
            <Node id="after_text" />
          </GraphPortal>
        </Digraph>,
      );

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(1);

      root.unmount();
    });

    it('handles portal with conditional children', async () => {
      const root = createRoot();
      const showNode = true;

      await root.render(
        <Digraph id="test">
          <GraphPortal>{showNode && <Node id="conditional" />}</GraphPortal>
        </Digraph>,
      );

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(1);

      const graph = models[0];
      if (graph.$$type === 'Graph') {
        const nodes = Array.from(graph.nodes.values());
        expect(nodes.some((node) => node.id === 'conditional')).toBe(true);
      }

      root.unmount();
    });

    it('handles portal with array of children', async () => {
      const root = createRoot();
      const nodeIds = ['n1', 'n2', 'n3'];

      await root.render(
        <Digraph id="test">
          <GraphPortal>
            {nodeIds.map((id) => (
              <Node key={id} id={id} />
            ))}
          </GraphPortal>
        </Digraph>,
      );

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(1);

      const graph = models[0];
      if (graph.$$type === 'Graph') {
        const nodes = Array.from(graph.nodes.values());
        expect(nodes).toHaveLength(3);
        nodeIds.forEach((id) => {
          expect(nodes.some((node) => node.id === id)).toBe(true);
        });
      }

      root.unmount();
    });

    it('handles deeply nested portal targeting', async () => {
      const dot = await renderToDot(
        <Digraph id="test">
          <Subgraph id="cluster_level1">
            <Subgraph id="cluster_level2">
              <Subgraph id="cluster_level3">
                <Node id="deep_node" />
                <GraphPortal id="cluster_level3">
                  <Node id="portal_node" />
                </GraphPortal>
              </Subgraph>
            </Subgraph>
          </Subgraph>
        </Digraph>,
      );

      expect(dot).toContain('subgraph "cluster_level3"');
      expect(dot).toContain('"deep_node"');
      expect(dot).toContain('"portal_node"');
    });
  });

  describe('Real-world Use Cases', () => {
    it('allows organizing nodes in clusters without deep nesting', async () => {
      const dot = await renderToDot(
        <Digraph id="architecture">
          <Subgraph id="cluster_frontend">
            <Node id="ui" label="UI" />
            <GraphPortal id="cluster_frontend">
              <Node id="components" label="Components" />
            </GraphPortal>
          </Subgraph>
          <Subgraph id="cluster_backend">
            <Node id="api" label="API" />
            <GraphPortal id="cluster_backend">
              <Node id="database" label="Database" />
            </GraphPortal>
          </Subgraph>
          <Edge targets={['ui', 'api']} />
        </Digraph>,
      );

      expect(dot).toContain('subgraph "cluster_frontend"');
      expect(dot).toContain('subgraph "cluster_backend"');
      expect(dot).toContain('"ui"');
      expect(dot).toContain('"components"');
      expect(dot).toContain('"api"');
      expect(dot).toContain('"database"');
      expect(dot).toContain('"ui" -> "api"');
    });
  });
});
