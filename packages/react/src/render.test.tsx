import { describe, expect, it } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Edge } from './components/Edge.js';
import { Graph } from './components/Graph.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { type RenderOptions, render, renderToDot } from './render.js';
import './types.js';

// Common test examples
const CompleteDigraphExample = () => (
  <Digraph>
    <Node id="a" label="Node A" />
    <Node id="b" label={<dot:b>bold</dot:b>} />
    <Subgraph id="cluster_x" label="Cluster X">
      <Node id="c" label="Node C" />
    </Subgraph>
    <Edge targets={['a', 'b']} />
  </Digraph>
);

const CompleteUndirectedGraphExample = () => (
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
        expect(result.graph).toBeDefined();
        expect(result.graph.nodes.length).toBe(2); // nodes a, b (direct children only)
        expect(result.graph.edges.length).toBe(1); // edge a -> b
        expect(result.graph.subgraphs.length).toBe(1); // cluster_x
        expect(result.graph.subgraphs[0].nodes.length).toBe(1); // node c inside subgraph
      });

      it('should render complete undirected graph with proper structure', async () => {
        const result = await render(<CompleteUndirectedGraphExample />);
        expect(result.graph).toBeDefined();
        expect(result.graph.nodes.length).toBe(2); // nodes a, b (direct children only)
        expect(result.graph.edges.length).toBe(1); // edge a -- b
        expect(result.graph.subgraphs.length).toBe(1); // cluster_x
        expect(result.graph.subgraphs[0].nodes.length).toBe(1); // node c inside subgraph
      });

      it('should respect timeout option', async () => {
        const options: RenderOptions = { timeout: 100 };
        // This should complete normally within 100ms
        const result = await render(<CompleteDigraphExample />, options);
        expect(result.graph).toBeDefined();
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

  describe('Concurrent Options', () => {
    describe('concurrent mode (default)', () => {
      it('should render digraph with concurrent mode enabled by default', async () => {
        const result = await render(<CompleteDigraphExample />);
        expect(result.graph).toBeDefined();
        expect(result.graph.nodes.length).toBe(2);
        expect(result.graph.edges.length).toBe(1);
        expect(result.graph.subgraphs.length).toBe(1);
      });

      it('should render with explicit concurrent=true', async () => {
        const result = await render(<CompleteDigraphExample />, {
          concurrent: true,
        });
        expect(result.graph).toBeDefined();
        expect(result.graph.nodes.length).toBe(2);
        expect(result.graph.edges.length).toBe(1);
        expect(result.graph.subgraphs.length).toBe(1);
      });

      it('should handle error callbacks with concurrent mode', async () => {
        let uncaughtError: Error | null = null;
        let caughtError: Error | null = null;

        const options: RenderOptions = {
          concurrent: true,
          onUncaughtError: (error) => {
            uncaughtError = error;
          },
          onCaughtError: (error) => {
            caughtError = error;
          },
        };

        const result = await render(<CompleteDigraphExample />, options);
        expect(result.graph).toBeDefined();
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
        expect(result.graph).toBeDefined();
        expect(result.graph.nodes.length).toBe(2);
        expect(result.graph.edges.length).toBe(1);
        expect(result.graph.subgraphs.length).toBe(1);
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
});
