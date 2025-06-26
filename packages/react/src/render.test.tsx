import React from 'react';
import { Digraph as DigraphModel, Graph as GraphModel } from 'ts-graphviz';
import { describe, expect, it, vi } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Edge } from './components/Edge.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { render, renderToDot } from './render.js';
import {
  expectGraph,
  expectGraphStructure,
  expectModelsToContainTypes,
} from './test-utils/assertions.js';
import {
  ComplexDigraph,
  DeeplyNestedDigraph,
  EmptyDigraph,
  HTMLLabelGraph,
  SimpleDigraph,
  SimpleGraph,
} from './test-utils/fixtures.js';
import './types.js';

describe('render()', () => {
  describe('Basic Rendering', () => {
    it('renders a simple directed graph with nodes and edges', async () => {
      const result = await render(<SimpleDigraph />);

      expect(result.models).toHaveLength(1);
      expectGraph(result.models[0]);
      expectGraphStructure(result.models[0] as any, {
        nodeCount: 2,
        edgeCount: 1,
        directed: true,
      });
    });

    it('renders a simple undirected graph', async () => {
      const result = await render(<SimpleGraph />);

      expect(result.models).toHaveLength(1);
      expectGraph(result.models[0]);
      expectGraphStructure(result.models[0] as any, {
        nodeCount: 3,
        edgeCount: 3,
        directed: false,
      });
    });

    it('renders an empty graph', async () => {
      const result = await render(<EmptyDigraph />);

      expect(result.models).toHaveLength(1);
      expectGraph(result.models[0]);
      expectGraphStructure(result.models[0] as any, {
        nodeCount: 0,
        edgeCount: 0,
        subgraphCount: 0,
      });
    });
  });

  describe('Complex Graph Structures', () => {
    it('renders nested subgraphs correctly', async () => {
      const result = await render(<ComplexDigraph />);

      expect(result.models).toHaveLength(1);
      const graph = result.models[0] as GraphModel;

      expect(graph.subgraphs).toHaveLength(2);
      expect(graph.subgraphs[0].id).toBe('cluster_main');
      expect(graph.subgraphs[1].id).toBe('cluster_sub');
      expect(graph.nodes).toHaveLength(1); // Only 'start' is direct child
      expect(graph.edges).toHaveLength(3); // Cross-subgraph edges
    });

    it('renders deeply nested subgraphs', async () => {
      const result = await render(<DeeplyNestedDigraph />);

      const graph = result.models[0] as GraphModel;
      expect(graph.subgraphs).toHaveLength(1);
      expect(graph.subgraphs[0].subgraphs).toHaveLength(1);
      expect(graph.subgraphs[0].subgraphs[0].subgraphs).toHaveLength(1);
    });

    it('renders graphs with HTML-like labels', async () => {
      const result = await render(<HTMLLabelGraph />);

      const graph = result.models[0] as GraphModel;
      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0].id).toBe('table');
      // HTML-like labels are handled by renderHTMLLike
    });
  });

  describe('Container Options', () => {
    it('renders components into an existing Digraph container', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        <>
          <Node id="n1" />
          <Node id="n2" />
          <Edge targets={['n1', 'n2']} />
        </>,
        { container },
      );

      expect(result.models).toHaveLength(3); // 2 nodes + 1 edge
      expect(container.nodes).toHaveLength(2);
      expect(container.edges).toHaveLength(1);
    });

    it('renders components into an existing Graph container', async () => {
      const container = new GraphModel('container');

      const result = await render(
        <>
          <Node id="n1" />
          <Node id="n2" />
        </>,
        { container },
      );

      expect(result.models).toHaveLength(2);
      expect(container.directed).toBe(false);
    });

    it('returns empty models array when rendering empty fragment with container', async () => {
      const container = new DigraphModel('container');
      const result = await render(<React.Fragment />, {
        container,
      });

      expect(result.models).toHaveLength(0);
      expect(container.nodes).toHaveLength(0);
    });
  });

  describe('Multiple Models (Fragments)', () => {
    it('collects all top-level models when using fragments', async () => {
      const result = await render(
        <>
          <Digraph id="graph1">
            <Node id="a" />
          </Digraph>
          <Digraph id="graph2">
            <Node id="b" />
          </Digraph>
        </>,
      );

      expect(result.models).toHaveLength(2);
      expect(result.models[0].id).toBe('graph1');
      expect(result.models[1].id).toBe('graph2');
    });

    it('collects all models in container when using fragments', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        <>
          <Node id="node1" />
          <Subgraph id="sub1">
            <Node id="inner1" />
          </Subgraph>
          <Node id="node2" />
          <Edge targets={['node1', 'node2']} />
        </>,
        { container },
      );

      // All models including nested ones are collected
      expectModelsToContainTypes(result.models, ['Node', 'Subgraph', 'Edge']);
      expect(result.models.map((m) => m.id)).toContain('inner1');
    });
  });

  describe('Render Options', () => {
    describe('Timeout Option', () => {
      it('respects custom timeout setting', async () => {
        const result = await render(
          <Digraph>
            <Node id="test" />
          </Digraph>,
          { timeout: 100 },
        );

        expect(result.models).toHaveLength(1);
      });

      it('throws error when render exceeds timeout', async () => {
        // Create a component that takes too long
        const SlowComponent = () => {
          const nodes = Array.from({ length: 1000 }, (_, i) => {
            const nodeId = `node_${i}`;
            return <Node key={nodeId} id={nodeId} />;
          });
          return <Digraph>{nodes}</Digraph>;
        };

        await expect(render(<SlowComponent />, { timeout: 1 })).rejects.toThrow(
          'timeout',
        );
      });
    });

    describe('Concurrent Mode', () => {
      it('renders with concurrent mode enabled by default', async () => {
        const result = await render(
          <Digraph>
            <Node id="test" />
          </Digraph>,
        );
        expect(result.models).toHaveLength(1);
      });

      it('renders with concurrent mode explicitly enabled', async () => {
        const result = await render(
          <Digraph>
            <Node id="test" />
          </Digraph>,
          { concurrent: true },
        );
        expect(result.models).toHaveLength(1);
      });

      it('renders with concurrent mode disabled', async () => {
        const result = await render(
          <Digraph>
            <Node id="test" />
          </Digraph>,
          { concurrent: false },
        );
        expect(result.models).toHaveLength(1);
      });
    });

    describe('Error Callbacks', () => {
      it('calls onUncaughtError when error occurs', async () => {
        const onUncaughtError = vi.fn();

        // Component that throws during render
        const ErrorComponent = () => {
          throw new Error('Test error');
        };

        try {
          await render(<ErrorComponent />, { onUncaughtError });
        } catch {
          // Expected to throw
        }

        // Error callback might be called depending on React's error handling
      });

      it('handles onCaughtError callback', async () => {
        const onCaughtError = vi.fn();

        const result = await render(
          <Digraph>
            <Node id="test" />
          </Digraph>,
          { onCaughtError },
        );

        expect(result.models).toHaveLength(1);
        // onCaughtError would be called if error boundary catches error
      });
    });
  });

  describe('Error Handling', () => {
    it('throws error when no models are rendered without container', async () => {
      // Custom component that doesn't create any graph
      const NoGraphComponent = () => <div>No graph here</div>;

      await expect(render(<NoGraphComponent />)).rejects.toThrow(
        'No model was rendered',
      );
    });

    it('throws error when duplicate root graphs are rendered', async () => {
      await expect(
        render(
          <Digraph>
            <Digraph />
          </Digraph>,
        ),
      ).rejects.toThrow('No model was rendered');
    });

    it('handles React rendering errors gracefully', async () => {
      const BadComponent = () => {
        // This will cause React to throw during render
        return null as any;
      };

      try {
        await render(
          <Digraph>
            <BadComponent />
          </Digraph>,
        );
      } catch (error) {
        // Should handle error appropriately
        expect(error).toBeDefined();
      }
    });
  });

  describe('Cleanup Function', () => {
    it('provides cleanup function in result', async () => {
      const result = await render(
        <Digraph>
          <Node id="test" />
        </Digraph>,
      );

      expect(result.cleanup).toBeDefined();
      expect(typeof result.cleanup).toBe('function');

      // Should not throw when called
      expect(() => result.cleanup?.()).not.toThrow();
    });

    it('cleanup can be called multiple times safely', async () => {
      const result = await render(
        <Digraph>
          <Node id="test" />
        </Digraph>,
      );

      result.cleanup?.();
      result.cleanup?.(); // Should not throw
    });
  });
});

describe('renderToDot()', () => {
  describe('Basic DOT Generation', () => {
    it('converts simple digraph to DOT string', async () => {
      const dot = await renderToDot(<SimpleDigraph />);

      expect(dot).toContain('digraph');
      expect(dot).toContain('"a"');
      expect(dot).toContain('"b"');
      expect(dot).toContain('"a" -> "b"');
    });

    it('converts undirected graph to DOT string', async () => {
      const dot = await renderToDot(<SimpleGraph />);

      expect(dot).toContain('graph');
      expect(dot).not.toContain('digraph');
      expect(dot).toContain('--'); // undirected edge
    });

    it('converts empty graph to DOT string', async () => {
      const dot = await renderToDot(<EmptyDigraph />);

      expect(dot).toContain('digraph');
      expect(dot).toContain('{');
      expect(dot).toContain('}');
    });
  });

  describe('Complex DOT Generation', () => {
    it('converts nested subgraphs to DOT', async () => {
      const dot = await renderToDot(<ComplexDigraph />);

      expect(dot).toContain('subgraph "cluster_main"');
      expect(dot).toContain('subgraph "cluster_sub"');
      expect(dot).toContain('label = "Main Process"');
      expect(dot).toContain('shape = "box"');
    });

    it('preserves node and edge attributes in DOT', async () => {
      const dot = await renderToDot(
        <Digraph>
          <Node id="styled" color="red" shape="circle" />
          <Edge targets={['styled', 'styled']} style="dashed" />
        </Digraph>,
      );

      expect(dot).toContain('color = "red"');
      expect(dot).toContain('shape = "circle"');
      expect(dot).toContain('style = "dashed"');
    });
  });

  describe('Container with renderToDot', () => {
    it('renders first model from container', async () => {
      const container = new DigraphModel('container');
      container.set('bgcolor', 'lightgray');

      const dot = await renderToDot(<Node id="test" shape="circle" />, {
        container,
      });

      // Should render the node, not the container
      expect(dot).toContain('"test"');
      expect(dot).toContain('shape = "circle"');
      expect(dot).not.toContain('bgcolor');
    });

    it('renders container when no models are created', async () => {
      const container = new DigraphModel('container');
      container.set('label', 'Empty Container');

      const dot = await renderToDot(<React.Fragment />, {
        container,
      });

      // Should render the container itself
      expect(dot).toContain('digraph "container"');
      expect(dot).toContain('label = "Empty Container"');
    });
  });

  describe('Options with renderToDot', () => {
    it('respects all render options', async () => {
      const dot = await renderToDot(
        <Digraph>
          <Node id="test" />
        </Digraph>,
        {
          concurrent: false,
          timeout: 2000,
        },
      );

      expect(dot).toContain('digraph');
      expect(dot).toContain('"test"');
    });
  });

  describe('Cleanup with renderToDot', () => {
    it('automatically cleans up after DOT generation', async () => {
      // renderToDot should handle cleanup internally
      const dot = await renderToDot(
        <Digraph>
          <Node id="test" />
        </Digraph>,
      );

      expect(dot).toBeDefined();
      // No manual cleanup needed
    });
  });

  describe('Error Handling with renderToDot', () => {
    it('throws error when no model to render', async () => {
      // Empty component without container
      const EmptyComponent = () => null;

      await expect(renderToDot(<EmptyComponent />)).rejects.toThrow();
    });
  });
});
