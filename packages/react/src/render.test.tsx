import type { ReactElement } from 'react';
import { Digraph as DigraphModel, Graph as GraphModel } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Edge } from './components/Edge.js';
import { Graph } from './components/Graph.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { type RenderOptions, render, renderToDot } from './render.js';
import './types.js';

// Common test examples
const CompleteDigraphExample = (): ReactElement => (
  <Digraph>
    <Node id="a" label="Node A" />
    <Node id="b" label={<dot:b>bold</dot:b>} />
    <Subgraph id="cluster_x" label="Cluster X">
      <Node id="c" label="Node C" />
    </Subgraph>
    <Edge targets={['a', 'b']} />
  </Digraph>
);

const CompleteUndirectedGraphExample = (): ReactElement => (
  <Graph>
    <Node id="a" label="Node A" />
    <Node id="b" label="Node B" />
    <Subgraph id="cluster_x" label="Cluster X">
      <Node id="c" label="Node C" />
    </Subgraph>
    <Edge targets={['a', 'b']} />
  </Graph>
);

describe('Rendering API', () => {
  describe('render', () => {
    describe('graph structure validation', () => {
      it('should render complete digraph with proper structure', async () => {
        const result = await render(<CompleteDigraphExample />);
        expect(result.model).toBeDefined();
        expect(result.model.nodes.length).toBe(2); // nodes a, b (direct children only)
        expect(result.model.edges.length).toBe(1); // edge a -> b
        expect(result.model.subgraphs.length).toBe(1); // cluster_x
        expect(result.model.subgraphs[0].nodes.length).toBe(1); // node c inside subgraph
      });

      it('should render complete undirected graph with proper structure', async () => {
        const result = await render(<CompleteUndirectedGraphExample />);
        expect(result.model).toBeDefined();
        expect(result.model.nodes.length).toBe(2); // nodes a, b (direct children only)
        expect(result.model.edges.length).toBe(1); // edge a -- b
        expect(result.model.subgraphs.length).toBe(1); // cluster_x
        expect(result.model.subgraphs[0].nodes.length).toBe(1); // node c inside subgraph
      });

      it('should respect timeout option', async () => {
        const options: RenderOptions = { timeout: 100 };
        // This should complete normally within 100ms
        const result = await render(<CompleteDigraphExample />, options);
        expect(result.model).toBeDefined();
      });
    });

    describe('error handling', () => {
      it('should throw error when no root graph container is provided', async () => {
        await expect(render(<Node id="orphan" />)).rejects.toThrow(
          'There are no clusters of container(Subgraph, Digraph, Graph).',
        );
      });
    });
  });

  describe('renderToDot', () => {
    describe('DOT language generation', () => {
      it('should render complete digraph with nodes, edges, and subgraph', async () => {
        const dot = await renderToDot(<CompleteDigraphExample />);
        expect(dot).toMatchInlineSnapshot(`
          "digraph {
            "a" [
              label = "Node A";
            ];
            "b" [
              label = <<b>bold</b>>;
            ];
            subgraph "cluster_x" {
              label = "Cluster X";
              "c" [
                label = "Node C";
              ];
            }
            "a" -> "b";
          }"
        `);
      });

      it('should render complete undirected graph with nodes, edges, and subgraph', async () => {
        const dot = await renderToDot(<CompleteUndirectedGraphExample />);
        expect(dot).toMatchInlineSnapshot(`
          "graph {
            "a" [
              label = "Node A";
            ];
            "b" [
              label = "Node B";
            ];
            subgraph "cluster_x" {
              label = "Cluster X";
              "c" [
                label = "Node C";
              ];
            }
            "a" -- "b";
          }"
        `);
      });

      it('should respect timeout option', async () => {
        const options: RenderOptions = { timeout: 1000 };
        const dot = await renderToDot(<CompleteDigraphExample />, options);
        expect(dot).toContain('digraph');
      });
    });

    describe('error handling', () => {
      it('should throw error for invalid graph structure', async () => {
        await expect(renderToDot(<Node id="orphan" />)).rejects.toThrow(
          'There are no clusters of container(Subgraph, Digraph, Graph).',
        );
      });
    });
  });

  describe('Container Option', () => {
    it('should render into provided Digraph container', async () => {
      const container = new DigraphModel('custom-container');

      const result = await render(
        <>
          <Node id="a" label="Node A" />
          <Node id="b" label="Node B" />
          <Edge targets={['a', 'b']} />
        </>,
        { container }
      );

      expect(result.model).toBe(container);
      expect(result.model.id).toBe('custom-container');
      expect(result.model.nodes.length).toBe(2);
      expect(result.model.edges.length).toBe(1);
    });

    it('should render into provided Graph container', async () => {
      const container = new GraphModel('custom-undirected');

      const result = await render(
        <>
          <Node id="x" label="Node X" />
          <Node id="y" label="Node Y" />
          <Edge targets={['x', 'y']} />
        </>,
        { container }
      );

      expect(result.model).toBe(container);
      expect(result.model.id).toBe('custom-undirected');
      expect(result.model.nodes.length).toBe(2);
      expect(result.model.edges.length).toBe(1);
    });

    it('should generate DOT with container option', async () => {
      const container = new DigraphModel('test-graph');
      container.apply({ rankdir: 'LR' });

      const dot = await renderToDot(
        <>
          <Node id="start" label="Start" />
          <Node id="end" label="End" />
          <Edge targets={['start', 'end']} />
        </>,
        { container }
      );

      expect(dot).toContain('digraph "test-graph"');
      expect(dot).toContain('rankdir = "LR"');
      expect(dot).toContain('"start"');
      expect(dot).toContain('"end"');
    });
  });

  describe('Concurrent Options', () => {
    describe('concurrent mode (default)', () => {
      it('should render digraph with concurrent mode enabled by default', async () => {
        const result = await render(<CompleteDigraphExample />);
        expect(result.model).toBeDefined();
        expect(result.model.nodes.length).toBe(2);
        expect(result.model.edges.length).toBe(1);
        expect(result.model.subgraphs.length).toBe(1);
      });

      it('should render with explicit concurrent=true', async () => {
        const result = await render(<CompleteDigraphExample />, {
          concurrent: true,
        });
        expect(result.model).toBeDefined();
        expect(result.model.nodes.length).toBe(2);
        expect(result.model.edges.length).toBe(1);
        expect(result.model.subgraphs.length).toBe(1);
      });

      it('should handle error callbacks with concurrent mode', async () => {
        let uncaughtError: Error | null = null;
        let caughtError: Error | null = null;

        const options: RenderOptions = {
          concurrent: true,
          onUncaughtError: (error: Error | null) => {
            uncaughtError = error;
          },
          onCaughtError: (error: Error | null) => {
            caughtError = error;
          },
        };

        const result = await render(<CompleteDigraphExample />, options);
        expect(result.model).toBeDefined();
        // No errors should occur for valid rendering
        expect(uncaughtError).toBeNull();
        expect(caughtError).toBeNull();
      });
    });

    describe('non-concurrent mode', () => {
      it('should render with concurrent=false', async () => {
        const result = await render(<CompleteDigraphExample />, {
          concurrent: false,
        });
        expect(result.model).toBeDefined();
        expect(result.model.nodes.length).toBe(2);
        expect(result.model.edges.length).toBe(1);
        expect(result.model.subgraphs.length).toBe(1);
      });

      it('should generate DOT string with concurrent=false', async () => {
        const dot = await renderToDot(<CompleteDigraphExample />, {
          concurrent: false,
        });
        expect(dot).toContain('digraph');
        expect(dot).toContain('"a"');
        expect(dot).toContain('"b"');
        expect(dot).toContain('cluster_x');
        expect(dot).toContain('"a" -> "b"');
      });

      it('should reject promise for invalid structure with concurrent=false', async () => {
        await expect(
          render(<Node id="orphan" />, { concurrent: false }),
        ).rejects.toThrow(
          'There are no clusters of container(Subgraph, Digraph, Graph).',
        );
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty element with container', async () => {
      const { Digraph: DigraphModel } = await import('ts-graphviz');
      const container = new DigraphModel('empty-test');

      const result = await render(<></>, { container });

      expect(result.model).toBe(container);
      expect(result.model.nodes.length).toBe(0);
      expect(result.model.edges.length).toBe(0);
    });

    it('should handle error callbacks properly', async () => {
      let errorCount = 0;

      const result = await render(
        <Digraph>
          <Node id="a" />
          <Node id="b" />
        </Digraph>,
        {
          onUncaughtError: () => { errorCount++; },
          onCaughtError: () => { errorCount++; }
        }
      );

      // Valid rendering should not trigger error callbacks
      expect(result.model.nodes.length).toBe(2);
      expect(errorCount).toBe(0);
    });

    it('should support mixing container option with orphan nodes', async () => {
      const container = new DigraphModel('container');

      // Orphan nodes/edges should be added to the container
      const result = await render(
        <>
          <Node id="orphan1" />
          <Node id="orphan2" />
          <Edge targets={['orphan1', 'orphan2']} />
        </>,
        { container }
      );

      expect(result.model).toBe(container);
      expect(result.model.nodes.length).toBe(2);
      expect(result.model.edges.length).toBe(1);
    });

    it('should handle Digraph component without container', async () => {
      // When no container is provided, Digraph creates its own
      const result = await render(
        <Digraph id="test-digraph">
          <Node id="a" />
          <Node id="b" />
          <Edge targets={['a', 'b']} />
        </Digraph>
      );

      expect(result.model.id).toBe('test-digraph');
      expect((result.model as any).directed).toBe(true);
      expect(result.model.nodes.length).toBe(2);
      expect(result.model.edges.length).toBe(1);
    });

    it('should handle error callback with invalid component', async () => {
      let capturedError: Error | null = null;

      const ThrowingComponent = (): ReactElement => {
        throw new Error('Component error');
      };

      await expect(
        render(<ThrowingComponent />, {
          onUncaughtError: (error: Error | null) => {
            capturedError = error;
          },
        })
      ).rejects.toThrow();

      // Error handling depends on React's error boundary behavior
      // The error should propagate since we don't have error boundaries
    });

    it('should handle timeout with long-running render', async () => {
      // Create a component that would take time to render
      const SlowComponent = (): ReactElement => {
        const nodes = [];
        for (let i = 0; i < 100; i++) {
          nodes.push(<Node key={i} id={`node-${i}`} />);
        }
        return <Digraph>{nodes}</Digraph>;
      };

      // With a reasonable timeout, it should complete
      const result = await render(<SlowComponent />, { timeout: 5000 });
      expect(result.model.nodes.length).toBe(100);
    });
  });

  describe('Combined Options', () => {
    it('should work with container and concurrent options together', async () => {
      const container = new DigraphModel('combined-test');

      const result = await render(
        <>
          <Node id="a" />
          <Node id="b" />
          <Edge targets={['a', 'b']} />
        </>,
        {
          container,
          concurrent: true,
          timeout: 1000
        }
      );

      expect(result.model).toBe(container);
      expect(result.model.id).toBe('combined-test');
      expect(result.model.nodes.length).toBe(2);
    });

    it('should handle all options with renderToDot', async () => {
      const container = new GraphModel();
      container.apply({ bgcolor: 'lightgray' });

      const dot = await renderToDot(
        <>
          <Node id="test" shape="circle" />
        </>,
        {
          container,
          concurrent: false,
          timeout: 2000
        }
      );

      expect(dot).toContain('graph {');
      expect(dot).toContain('bgcolor = "lightgray"');
      expect(dot).toContain('shape = "circle"');
    });

    it('should handle container with subgraphs', async () => {
      const container = new DigraphModel('parent');

      const result = await render(
        <>
          <Subgraph id="cluster_1">
            <Node id="a" />
            <Node id="b" />
          </Subgraph>
          <Subgraph id="cluster_2">
            <Node id="c" />
            <Node id="d" />
          </Subgraph>
          <Edge targets={['a', 'c']} />
          <Edge targets={['b', 'd']} />
        </>,
        { container }
      );

      expect(result.model).toBe(container);
      expect(result.model.subgraphs.length).toBe(2);
      expect(result.model.edges.length).toBe(2);
      // Nodes are inside subgraphs, not direct children
      expect(result.model.nodes.length).toBe(0);
    });
  });

  describe('Type Safety and API Compatibility', () => {
    it('should accept container of different GraphBaseModel types', async () => {

      // Test with Digraph container
      const digraphContainer = new DigraphModel();
      const result1 = await render(<Node id="d1" />, { container: digraphContainer });
      expect(result1.model).toBe(digraphContainer);

      // Test with Graph container
      const graphContainer = new GraphModel();
      const result2 = await render(<Node id="g1" />, { container: graphContainer });
      expect(result2.model).toBe(graphContainer);

      // Note: Subgraph cannot be used as a root container
    });

    it('should maintain all options when using renderToDot', async () => {
      let errorCalled = false;
      const dot = await renderToDot(
        <Digraph>
          <Node id="test" />
        </Digraph>,
        {
          concurrent: true,
          timeout: 2000,
          onUncaughtError: () => { errorCalled = true; }
        }
      );

      expect(dot).toContain('digraph');
      expect(errorCalled).toBe(false);
    });
  });
});
