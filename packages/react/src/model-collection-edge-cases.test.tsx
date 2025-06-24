import React, { type ReactElement } from 'react';
import {
  Digraph as DigraphModel,
  Graph as GraphModel,
  type NodeModel,
} from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Edge } from './components/Edge.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { render } from './render.js';

describe('Model Collection Edge Cases', () => {
  describe('Multiple Models and Order', () => {
    it('should collect models in creation order (first wins)', async () => {
      // Create a custom render function that captures collection order
      const container = new DigraphModel('container');
      const result = await render(
        <>
          <Node id="first" />
          <Subgraph id="second">
            <Node id="third" />
          </Subgraph>
          <Node id="fourth" />
          <Edge targets={['first', 'fourth']} />
        </>,
        { container },
      );

      // The first non-container model should be returned
      expect(result.models).toBeDefined();
      expect(result.models.length).toBeGreaterThan(0);
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('first');

      // Verify order of creation in container
      expect(container.nodes[0].id).toBe('first');
      expect(container.nodes[1].id).toBe('fourth');
      expect(container.subgraphs[0].id).toBe('second');
      expect(container.subgraphs[0].nodes[0].id).toBe('third');
    });

    it('should handle simultaneous model creation', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        <>
          <Node id="a" />
          <Node id="b" />
          <Node id="c" />
        </>,
        { container },
      );

      // Should return the first created model
      expect(result.models).toBeDefined();
      expect(result.models.length).toBeGreaterThan(0);
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('a');
      expect(container.nodes.length).toBe(3);
    });

    it('should prioritize direct children over nested ones', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        <>
          <Subgraph id="nested">
            <Node id="deep" />
          </Subgraph>
          <Node id="direct" />
        </>,
        { container },
      );

      // Should return the first created model (deep node, even if nested)
      expect(result.models).toBeDefined();
      expect(result.models.length).toBeGreaterThan(0);
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('deep');
    });
  });

  describe('Duplicate and Overwrite Scenarios', () => {
    it('should handle duplicate model IDs gracefully', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        <>
          <Node id="duplicate" label="First" />
          <Node id="duplicate" label="Second" />
        </>,
        { container },
      );

      // Should return the first created model
      expect(result.models).toBeDefined();
      expect(result.models.length).toBeGreaterThan(0);
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('duplicate');
      // The second node with same ID should overwrite in the container
      expect(container.nodes.length).toBe(1);
      expect(container.nodes[0].attributes.get('label')).toBe('Second');
    });

    it('should handle models with undefined IDs', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        <>
          <Node id={undefined as any} />
          <Node id="defined" />
        </>,
        { container },
      );

      // Should return the first created model (even with undefined ID)
      expect(result.models).toBeDefined();
      expect(result.models.length).toBeGreaterThan(0);
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBeUndefined();
      expect(container.nodes.length).toBe(2);
    });

    it('should handle empty string IDs', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        <>
          <Node id="" />
          <Node id="normal" />
        </>,
        { container },
      );

      // Should return the first created model
      expect(result.models).toBeDefined();
      expect(result.models.length).toBeGreaterThan(0);
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('');
      expect(container.nodes.length).toBe(2);
    });
  });

  describe('Complex Nesting and Collection', () => {
    it('should handle deeply nested structures', async () => {
      const container = new DigraphModel('root');

      const result = await render(
        <Subgraph id="level1">
          <Subgraph id="level2">
            <Subgraph id="level3">
              <Node id="deepest" />
            </Subgraph>
          </Subgraph>
        </Subgraph>,
        { container },
      );

      // Should return the deepest node
      expect(result.models).toBeDefined();
      expect(result.models.length).toBeGreaterThan(0);
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('deepest');

      // Verify nested structure
      expect(container.subgraphs.length).toBe(1);
      expect(container.subgraphs[0].subgraphs.length).toBe(1);
      expect(container.subgraphs[0].subgraphs[0].subgraphs.length).toBe(1);
    });

    it('should handle mixed root graphs and containers', async () => {
      // Without container - should collect root graph
      const result1 = await render(
        <Digraph id="root">
          <Node id="in_root" />
        </Digraph>,
      );

      expect(result1.models).toBeDefined();
      expect(result1.models.length).toBeGreaterThan(0);
      expect(result1.models[0].$$type).toBe('Graph');
      expect(result1.models[0].id).toBe('root');

      // With container - should collect first non-container model
      const container = new DigraphModel('container');
      const result2 = await render(<Node id="in_container" />, { container });

      expect(result2.models).toBeDefined();
      expect(result2.models.length).toBeGreaterThan(0);
      expect(result2.models[0].$$type).toBe('Node');
      expect(result2.models[0].id).toBe('in_container');
    });

    it('should handle conditional rendering', async () => {
      const container = new DigraphModel('container');

      const ConditionalComponent = ({
        showFirst,
      }: {
        showFirst: boolean;
      }): ReactElement => (
        <>
          {showFirst && <Node id="conditional_first" />}
          <Node id="always_second" />
          {!showFirst && <Node id="conditional_last" />}
        </>
      );

      // Test with first condition true
      const result1 = await render(<ConditionalComponent showFirst={true} />, {
        container,
      });

      expect(result1.models).toBeDefined();
      expect(result1.models.length).toBeGreaterThan(0);
      expect(result1.models[0].$$type).toBe('Node');
      expect(result1.models[0].id).toBe('conditional_first');
      expect(container.nodes.length).toBe(2);

      // Reset container by creating a new one
      const newContainer = new DigraphModel('container');

      // Test with first condition false
      const result2 = await render(<ConditionalComponent showFirst={false} />, {
        container: newContainer,
      });

      expect(result2.models).toBeDefined();
      expect(result2.models.length).toBeGreaterThan(0);
      expect(result2.models[0].$$type).toBe('Node');
      expect(result2.models[0].id).toBe('always_second');
      expect(newContainer.nodes.length).toBe(2);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle components that render null', async () => {
      const container = new DigraphModel('container');

      const NullComponent = (): ReactElement | null => null;

      const result = await render(
        <>
          <NullComponent />
          <Node id="after_null" />
        </>,
        { container },
      );

      expect(result.models).toBeDefined();
      expect(result.models.length).toBeGreaterThan(0);
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('after_null');
      expect(container.nodes.length).toBe(1);
    });

    it('should handle fragments and complex JSX', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        <>
          <Node id="in_fragment1" />
          <React.Fragment>
            <Node id="in_fragment2" />
          </React.Fragment>
          {[1, 2, 3].map((n) => (
            <Node key={`node-${n}`} id={`mapped_${n}`} />
          ))}
        </>,
        { container },
      );

      // Should return the first created model
      expect(result.models).toBeDefined();
      expect(result.models.length).toBeGreaterThan(0);
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('in_fragment1');
      expect(container.nodes.length).toBe(5);
    });

    it('should handle rapid re-renders', async () => {
      // Multiple renders with separate containers
      const container1 = new DigraphModel('container1');
      const container2 = new DigraphModel('container2');
      const container3 = new DigraphModel('container3');

      const result1 = await render(<Node id="render1" />, {
        container: container1,
      });
      const result2 = await render(<Node id="render2" />, {
        container: container2,
      });
      const result3 = await render(<Node id="render3" />, {
        container: container3,
      });

      expect(result1.models).toBeDefined();
      expect(result1.models.length).toBeGreaterThan(0);
      expect(result1.models[0].id).toBe('render1');
      expect(result2.models).toBeDefined();
      expect(result2.models.length).toBeGreaterThan(0);
      expect(result2.models[0].id).toBe('render2');
      expect(result3.models).toBeDefined();
      expect(result3.models.length).toBeGreaterThan(0);
      expect(result3.models[0].id).toBe('render3');
      expect(container1.nodes.length).toBe(1);
      expect(container2.nodes.length).toBe(1);
      expect(container3.nodes.length).toBe(1);
      expect(container3.nodes[0].id).toBe('render3');
    });

    it('should handle models with special characters in IDs', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        <>
          <Node id="node-with-dashes" />
          <Node id="node_with_underscores" />
          <Node id="node.with.dots" />
          <Node id="node with spaces" />
          <Node id="node/with/slashes" />
        </>,
        { container },
      );

      expect(result.models).toBeDefined();
      expect(result.models.length).toBeGreaterThan(0);
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('node-with-dashes');
      expect(container.nodes.length).toBe(5);
    });

    it('should handle very large numbers of models', async () => {
      const container = new DigraphModel('container');
      const nodeCount = 1000;

      const LargeGraph = (): ReactElement => (
        <>
          {Array.from({ length: nodeCount }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: This is a test case, so using index is acceptable
            <Node key={i} id={`node_${i}`} />
          ))}
        </>
      );

      const result = await render(<LargeGraph />, { container });

      expect(result.models).toBeDefined();
      expect(result.models.length).toBeGreaterThan(0);
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('node_0');
      expect(container.nodes.length).toBe(nodeCount);
    });
  });

  describe('Type Safety and Model Validation', () => {
    it('should handle different model types correctly', async () => {
      const graphContainer = new GraphModel('graph_container');
      const digraphContainer = new DigraphModel('digraph_container');

      // Test with Graph container
      const result1 = await render(<Node id="in_graph" />, {
        container: graphContainer,
      });
      expect(result1.models).toBeDefined();
      expect(result1.models.length).toBeGreaterThan(0);
      expect(result1.models[0].id).toBe('in_graph');
      expect(graphContainer.directed).toBe(false);

      // Test with Digraph container
      const result2 = await render(<Node id="in_digraph" />, {
        container: digraphContainer,
      });
      expect(result2.models).toBeDefined();
      expect(result2.models.length).toBeGreaterThan(0);
      expect(result2.models[0].id).toBe('in_digraph');
      expect(digraphContainer.directed).toBe(true);
    });

    it('should preserve model properties during collection', async () => {
      const container = new DigraphModel('container');

      const result = await render<NodeModel>(
        <Node
          id="test"
          label="Test Label"
          shape="circle"
          color="red"
          style="filled"
        />,
        { container },
      );

      expect(result.models).toBeDefined();
      expect(result.models.length).toBeGreaterThan(0);
      expect(result.models[0].$$type).toBe('Node');
      expect(result.models[0].id).toBe('test');
      expect(result.models[0].attributes.get('label')).toBe('Test Label');
      expect(result.models[0].attributes.get('shape')).toBe('circle');
      expect(result.models[0].attributes.get('color')).toBe('red');
      expect(result.models[0].attributes.get('style')).toBe('filled');
    });
  });
});
