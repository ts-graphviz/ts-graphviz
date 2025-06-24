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
        expect(result.models[0]).toBeDefined();
        expect(result.models[0].nodes.length).toBe(2); // nodes a, b (direct children only)
        expect(result.models[0].edges.length).toBe(1); // edge a -> b
        expect(result.models[0].subgraphs.length).toBe(1); // cluster_x
        expect(result.models[0].subgraphs[0].nodes.length).toBe(1); // node c inside subgraph
      });

      it('should render complete undirected graph with proper structure', async () => {
        const result = await render(<CompleteUndirectedGraphExample />);
        expect(result.models[0]).toBeDefined();
        expect(result.models[0].nodes.length).toBe(2); // nodes a, b (direct children only)
        expect(result.models[0].edges.length).toBe(1); // edge a -- b
        expect(result.models[0].subgraphs.length).toBe(1); // cluster_x
        expect(result.models[0].subgraphs[0].nodes.length).toBe(1); // node c inside subgraph
      });

      it('should respect timeout option', async () => {
        const options: RenderOptions = { timeout: 100 };
        // This should complete normally within 100ms
        const result = await render(<CompleteDigraphExample />, options);
        expect(result.models[0]).toBeDefined();
      });
    });

    describe('error handling', () => {
      it('should throw error when no root graph container is provided', async () => {
        await expect(render(<Node id="orphan" />)).rejects.toThrow(
          'No model was rendered. Ensure your React component creates at least one Graphviz element.',
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
          'No model was rendered. Ensure your React component creates at least one Graphviz element.',
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
        { container },
      );

      // Should return the first created model (Node), not the container
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('a');
      // Verify the container received the nodes and edges
      expect(container.nodes.length).toBe(2);
      expect(container.edges.length).toBe(1);
    });

    it('should render into provided Graph container', async () => {
      const container = new GraphModel('custom-undirected');

      const result = await render(
        <>
          <Node id="x" label="Node X" />
          <Node id="y" label="Node Y" />
          <Edge targets={['x', 'y']} />
        </>,
        { container },
      );

      // Should return the first created model (Node), not the container
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('x');
      // Verify the container received the nodes and edges
      expect(container.nodes.length).toBe(2);
      expect(container.edges.length).toBe(1);
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
        { container },
      );

      // Should return DOT for the first created model (Node "start")
      expect(dot).toContain('"start"');
      expect(dot).toContain('label = "Start"');
      // Should NOT contain the container's digraph structure
      expect(dot).not.toContain('digraph "test-graph"');
      expect(dot).not.toContain('rankdir = "LR"');
    });
  });

  describe('Concurrent Options', () => {
    describe('concurrent mode (default)', () => {
      it('should render digraph with concurrent mode enabled by default', async () => {
        const result = await render(<CompleteDigraphExample />);
        expect(result.models[0]).toBeDefined();
        expect(result.models[0].nodes.length).toBe(2);
        expect(result.models[0].edges.length).toBe(1);
        expect(result.models[0].subgraphs.length).toBe(1);
      });

      it('should render with explicit concurrent=true', async () => {
        const result = await render(<CompleteDigraphExample />, {
          concurrent: true,
        });
        expect(result.models[0]).toBeDefined();
        expect(result.models[0].nodes.length).toBe(2);
        expect(result.models[0].edges.length).toBe(1);
        expect(result.models[0].subgraphs.length).toBe(1);
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
        expect(result.models[0]).toBeDefined();
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
        expect(result.models[0]).toBeDefined();
        expect(result.models[0].nodes.length).toBe(2);
        expect(result.models[0].edges.length).toBe(1);
        expect(result.models[0].subgraphs.length).toBe(1);
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
          'No model was rendered. Ensure your React component creates at least one Graphviz element.',
        );
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty element with container', async () => {
      const { Digraph: DigraphModel } = await import('ts-graphviz');
      const container = new DigraphModel('empty-test');

      const result = await render(<div />, { container });

      expect(result.models).toHaveLength(0);
      expect(container.nodes.length).toBe(0);
      expect(container.edges.length).toBe(0);
    });

    it('should handle error callbacks properly', async () => {
      let errorCount = 0;

      const result = await render(
        <Digraph>
          <Node id="a" />
          <Node id="b" />
        </Digraph>,
        {
          onUncaughtError: () => {
            errorCount++;
          },
          onCaughtError: () => {
            errorCount++;
          },
        },
      );

      // Valid rendering should not trigger error callbacks
      expect(result.models[0].nodes.length).toBe(2);
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
        { container },
      );

      // Should return the first created model (Node), not the container
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('orphan1');
      // Verify the container received the nodes and edges
      expect(container.nodes.length).toBe(2);
      expect(container.edges.length).toBe(1);
    });

    it('should handle Digraph component without container', async () => {
      // When no container is provided, Digraph creates its own
      const result = await render(
        <Digraph id="test-digraph">
          <Node id="a" />
          <Node id="b" />
          <Edge targets={['a', 'b']} />
        </Digraph>,
      );

      expect(result.models[0].id).toBe('test-digraph');
      expect((result.models[0] as any).directed).toBe(true);
      expect(result.models[0].nodes.length).toBe(2);
      expect(result.models[0].edges.length).toBe(1);
    });

    it('should handle error callback with invalid component', async () => {
      const ThrowingComponent = (): ReactElement => {
        throw new Error('Component error');
      };

      function rejectOnUncaughtError(element: ReactElement) {
        return new Promise((resolve, reject) => {
          render(element, {
            onUncaughtError: (error: Error | null) => {
              if (error) {
                reject(error);
              } else {
                resolve(null);
              }
            },
          });
        });
      }

      await expect(
        rejectOnUncaughtError(
          <Digraph>
            <Node id="a" />
            <Node id="b" />
            {/* This will throw an error */}
            <ThrowingComponent />
          </Digraph>,
        ),
      ).rejects.toThrow('Component error');
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
      expect(result.models[0].nodes.length).toBe(100);
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
          timeout: 1000,
        },
      );

      // Should return the first created model (Node), not the container
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('a');
      // Verify the container received the nodes
      expect(container.nodes.length).toBe(2);
    });

    it('should handle all options with renderToDot', async () => {
      const container = new GraphModel({ bgcolor: 'lightgray' });

      const dot = await renderToDot(<Node id="test" shape="circle" />, {
        container,
        concurrent: false,
        timeout: 2000,
      });

      // Since container option returns the created Node, DOT shows Node structure
      expect(dot).toMatchInlineSnapshot(`
        ""test" [
          shape = "circle";
        ];"
      `);
      // Container attributes won't be in the DOT since we return the Node, not the container
      expect(dot).not.toContain('graph {');
      expect(dot).not.toContain('bgcolor = "lightgray"');
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
        { container },
      );

      // Should return the first created model (Node inside first Subgraph), not the container
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('a');
      // Verify the container received the subgraphs and edges
      expect(container.subgraphs.length).toBe(2);
      expect(container.edges.length).toBe(2);
      expect(container.nodes.length).toBe(0);
    });
  });

  describe('Type Safety and API Compatibility', () => {
    it('should accept container of different GraphBaseModel types', async () => {
      // Test with Digraph container
      const digraphContainer = new DigraphModel();
      const result1 = await render(<Node id="d1" />, {
        container: digraphContainer,
      });
      // Should return the created Node, not the container
      expect(result1.models[0].$$type).toBe('Node');
      expect(result1.models[0].id).toBe('d1');

      // Test with Graph container
      const graphContainer = new GraphModel();
      const result2 = await render(<Node id="g1" />, {
        container: graphContainer,
      });
      // Should return the created Node, not the container
      expect(result2.models[0].$$type).toBe('Node');
      expect(result2.models[0].id).toBe('g1');
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
          onUncaughtError: () => {
            errorCalled = true;
          },
        },
      );

      expect(dot).toContain('digraph');
      expect(errorCalled).toBe(false);
    });
  });

  describe('Model Collection Integration', () => {
    it('should collect all top-level models when using fragments', async () => {
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

      // Should return first model
      expect(result.models[0].$$type).toBe('Graph');
      expect(result.models[0].id).toBe('graph1');

      // Should collect all models
      expect(result.models).toHaveLength(2);
      expect(result.models[0].id).toBe('graph1');
      expect(result.models[1].id).toBe('graph2');
    });

    it('should collect multiple top-level models with container', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        <>
          <Node id="node1" />
          <Node id="node2" />
          <Edge targets={['node1', 'node2']} />
        </>,
        { container },
      );

      // Should return first model
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('node1');

      // Should collect all top-level models (nodes and edge)
      expect(result.models).toHaveLength(3);
      expect(result.models[0].id).toBe('node1');
      expect(result.models[1].id).toBe('node2');
      expect(result.models[2].$$type).toBe('Edge');
    });

    it('should collect the first root graph model (Digraph) when no container', async () => {
      const result = await render(
        <Digraph id="test">
          <Node id="a" />
          <Node id="b" />
        </Digraph>,
      );

      expect(result.models[0].$$type).toBe('Graph');
      expect(result.models[0].id).toBe('test');
      expect(result.models[0].directed).toBe(true);
    });

    it('should collect the first root graph model (Graph) when no container', async () => {
      const result = await render(
        <Graph id="test">
          <Node id="a" />
          <Node id="b" />
        </Graph>,
      );

      expect(result.models[0].$$type).toBe('Graph');
      expect(result.models[0].id).toBe('test');
      expect(result.models[0].directed).toBe(false);
    });

    it('should collect first non-container model when container is provided', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        <>
          <Node id="first" />
          <Node id="second" />
          <Edge targets={['first', 'second']} />
        </>,
        { container },
      );

      // Should return the first created Node, not the container
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('first');
      expect(container.nodes.length).toBe(2);
      expect(container.edges.length).toBe(1);
    });

    it('should handle mixed models and collect first non-container model', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        <>
          <Subgraph id="cluster">
            <Node id="inner" />
          </Subgraph>
          <Node id="outer" />
          <Edge targets={['inner', 'outer']} />
        </>,
        { container },
      );

      // Should return the first created model (Node inside Subgraph)
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('inner');
      expect(container.subgraphs.length).toBe(1);
      expect(container.nodes.length).toBe(1);
      expect(container.edges.length).toBe(1);
    });

    it('should ignore container model itself when collecting', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        // biome-ignore lint/complexity/noUselessFragments: This is a valid test case
        <>
          <Node id="test" />
        </>,
        { container },
      );

      // Should return the Node, not the container even if container is processed
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('test');
      expect(result.models[0]).not.toBe(container);
    });

    it('should fall back to container if no models are rendered', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        // biome-ignore lint/complexity/noUselessFragments: This is a valid test case
        <></>, // Empty fragment
        { container },
      );

      // Should return empty models array since no models were rendered
      expect(result.models).toHaveLength(0);
      expect(container.id).toBe('container');
    });

    it('should handle complex nested structure and collect correctly', async () => {
      const container = new DigraphModel('root');

      const result = await render(
        <>
          <Subgraph id="cluster1">
            <Subgraph id="cluster2">
              <Node id="deep_node" />
            </Subgraph>
            <Node id="shallow_node" />
          </Subgraph>
          <Node id="root_node" />
          <Edge targets={['deep_node', 'shallow_node']} />
          <Edge targets={['shallow_node', 'root_node']} />
        </>,
        { container },
      );

      // Should return the first created model (deep_node)
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('deep_node');

      // Should collect all non-container models (including nested ones)
      expect(result.models).toHaveLength(7); // all nodes, subgraphs, and edges
      expect(result.models[0].$$type).toBe('Node'); // deep_node
      expect(result.models[1].$$type).toBe('Subgraph'); // cluster2
      expect(result.models[2].$$type).toBe('Node'); // shallow_node
      expect(result.models[3].$$type).toBe('Subgraph'); // cluster1
      expect(result.models[4].$$type).toBe('Node'); // root_node
      expect(result.models[5].$$type).toBe('Edge'); // first edge
      expect(result.models[6].$$type).toBe('Edge'); // second edge

      // Verify container structure
      expect(container.subgraphs.length).toBe(1);
      expect(container.subgraphs[0].subgraphs.length).toBe(1);
      expect(container.nodes.length).toBe(1);
      expect(container.edges.length).toBe(2);
    });

    it('should handle empty fragments with container and return empty models array', async () => {
      const container = new DigraphModel('container');
      // biome-ignore lint/complexity/noUselessFragments: This is a valid test case
      const result = await render(<></>, { container });

      expect(result.models).toHaveLength(0); // empty models array
      expect(container.id).toBe('container'); // container still exists
    });

    it('should collect mixed model types in fragments', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        <>
          <Subgraph id="cluster1">
            <Node id="inner1" />
          </Subgraph>
          <Node id="outer1" />
          <Subgraph id="cluster2">
            <Node id="inner2" />
          </Subgraph>
          <Node id="outer2" />
          <Edge targets={['outer1', 'outer2']} />
        </>,
        { container },
      );

      // Should have collected all non-container models
      expect(result.models).toHaveLength(7); // all models including nested

      // Check some key models are included
      expect(result.models.map((m) => m.id)).toContain('inner1');
      expect(result.models.map((m) => m.id)).toContain('cluster1');
      expect(result.models.map((m) => m.id)).toContain('outer1');
      expect(result.models.map((m) => m.id)).toContain('outer2');
      expect(result.models.some((m) => m.$$type === 'Edge')).toBe(true);
    });
  });
});
