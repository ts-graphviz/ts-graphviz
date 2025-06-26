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
import {
  expectGraph,
  expectModelsToContainTypes,
  expectModelWithId,
  expectNode,
} from './test-utils/assertions.js';
import './types.js';

describe('Model Collection Edge Cases', () => {
  describe('Model Collection Order', () => {
    it('collects all models created during render with fragments', async () => {
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

      // All models should be collected (including nested ones)
      expect(result.models).toHaveLength(5); // first Node, third Node (from subgraph), Subgraph, fourth Node, Edge
      expectModelsToContainTypes(result.models, ['Node', 'Subgraph', 'Edge']);

      // Verify first model is the first created
      expectNode(result.models[0]);
      expect((result.models[0] as NodeModel).id).toBe('first');

      // Verify container structure
      expect(container.nodes).toHaveLength(2);
      expect(container.nodes[0].id).toBe('first');
      expect(container.nodes[1].id).toBe('fourth');
      expect(container.subgraphs).toHaveLength(1);
      expect(container.subgraphs[0].id).toBe('second');
      expect(container.subgraphs[0].nodes[0].id).toBe('third');
    });

    it('collects multiple simultaneous nodes in creation order', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        <>
          <Node id="a" />
          <Node id="b" />
          <Node id="c" />
        </>,
        { container },
      );

      expect(result.models).toHaveLength(3);
      expect(result.models.map((m) => m.id)).toEqual(['a', 'b', 'c']);
      result.models.forEach((model) => expectNode(model));
      expect(container.nodes).toHaveLength(3);
    });

    it('collects nested models before sibling models', async () => {
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

      expect(result.models).toHaveLength(3); // Node, Subgraph, Node
      expectNode(result.models[0]);
      expect((result.models[0] as NodeModel).id).toBe('deep');

      const subgraphModel = expectModelWithId(result.models, 'nested');
      const directModel = expectModelWithId(result.models, 'direct');
      expect(subgraphModel).toBeDefined();
      expect(directModel).toBeDefined();
    });
  });

  describe('Duplicate ID Handling', () => {
    it('handles duplicate node IDs by overwriting in container', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        <>
          <Node id="duplicate" label="First" />
          <Node id="duplicate" label="Second" />
        </>,
        { container },
      );

      // Both models are collected during render
      expect(result.models).toHaveLength(2);
      result.models.forEach((model) => expectNode(model));
      expect(result.models[0].id).toBe('duplicate');
      expect(result.models[1].id).toBe('duplicate');

      // Container has the final (overwritten) version
      expect(container.nodes).toHaveLength(1);
      expect(container.nodes[0].attributes.get('label')).toBe('Second');
    });

    it('handles nodes with undefined IDs correctly', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        <>
          <Node id={undefined as any} />
          <Node id="defined" />
        </>,
        { container },
      );

      expect(result.models).toHaveLength(2);
      result.models.forEach((model) => expectNode(model));

      expect(result.models[0].id).toBeUndefined();
      expect(result.models[1].id).toBe('defined');
      expect(container.nodes).toHaveLength(2);
    });

    it('handles nodes with empty string IDs correctly', async () => {
      const container = new DigraphModel('container');

      const result = await render(
        <>
          <Node id="" />
          <Node id="normal" />
        </>,
        { container },
      );

      expect(result.models).toHaveLength(2);
      result.models.forEach((model) => expectNode(model));

      expect(result.models[0].id).toBe('');
      expect(result.models[1].id).toBe('normal');
      expect(container.nodes).toHaveLength(2);
    });
  });

  describe('Complex Nested Structures', () => {
    it('collects all models from deeply nested subgraph hierarchy', async () => {
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

      // All nested models should be collected
      expect(result.models).toHaveLength(4); // Node + 3 Subgraphs
      expectModelsToContainTypes(result.models, ['Node', 'Subgraph']);

      const deepestNode = expectModelWithId(result.models, 'deepest');
      expectNode(deepestNode);

      // Verify nested structure in container
      expect(container.subgraphs).toHaveLength(1);
      expect(container.subgraphs[0].subgraphs).toHaveLength(1);
      expect(container.subgraphs[0].subgraphs[0].subgraphs).toHaveLength(1);
    });

    it('renders differently with and without containers', async () => {
      // Without container - collects only the root graph (not its children)
      const result1 = await render(
        <Digraph id="root">
          <Node id="in_root" />
        </Digraph>,
      );

      expect(result1.models).toHaveLength(1); // Only the root Graph
      expectGraph(result1.models[0]);
      expect(result1.models[0].id).toBe('root');

      // With container - collects only rendered models
      const container = new DigraphModel('container');
      const result2 = await render(<Node id="in_container" />, { container });

      expect(result2.models).toHaveLength(1);
      expectNode(result2.models[0]);
      expect((result2.models[0] as NodeModel).id).toBe('in_container');
    });

    it('handles conditional rendering correctly', async () => {
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
      const container1 = new DigraphModel('container1');
      const result1 = await render(<ConditionalComponent showFirst={true} />, {
        container: container1,
      });

      expect(result1.models).toHaveLength(2);
      expect(result1.models.map((m) => m.id)).toEqual([
        'conditional_first',
        'always_second',
      ]);
      result1.models.forEach((model) => expectNode(model));
      expect(container1.nodes).toHaveLength(2);

      // Test with first condition false
      const container2 = new DigraphModel('container2');
      const result2 = await render(<ConditionalComponent showFirst={false} />, {
        container: container2,
      });

      expect(result2.models).toHaveLength(2);
      expect(result2.models.map((m) => m.id)).toEqual([
        'always_second',
        'conditional_last',
      ]);
      result2.models.forEach((model) => expectNode(model));
      expect(container2.nodes).toHaveLength(2);
    });
  });

  describe('Special Component Cases', () => {
    it('handles components that render null', async () => {
      const container = new DigraphModel('container');

      const NullComponent = (): ReactElement | null => null;

      const result = await render(
        <>
          <NullComponent />
          <Node id="after_null" />
        </>,
        { container },
      );

      expect(result.models).toHaveLength(1);
      expectNode(result.models[0]);
      expect((result.models[0] as NodeModel).id).toBe('after_null');
      expect(container.nodes).toHaveLength(1);
    });

    it('handles React fragments and mapped JSX elements', async () => {
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

      expect(result.models).toHaveLength(5);
      result.models.forEach((model) => expectNode(model));

      const expectedIds = [
        'in_fragment1',
        'in_fragment2',
        'mapped_1',
        'mapped_2',
        'mapped_3',
      ];
      expect(result.models.map((m) => m.id)).toEqual(expectedIds);
      expect(container.nodes).toHaveLength(5);
    });

    it('handles multiple separate render operations correctly', async () => {
      const containers = [
        new DigraphModel('container1'),
        new DigraphModel('container2'),
        new DigraphModel('container3'),
      ];

      const results = await Promise.all([
        render(<Node id="render1" />, { container: containers[0] }),
        render(<Node id="render2" />, { container: containers[1] }),
        render(<Node id="render3" />, { container: containers[2] }),
      ]);

      results.forEach((result, index) => {
        expect(result.models).toHaveLength(1);
        expectNode(result.models[0]);
        expect((result.models[0] as NodeModel).id).toBe(`render${index + 1}`);
        expect(containers[index].nodes).toHaveLength(1);
        expect(containers[index].nodes[0].id).toBe(`render${index + 1}`);
      });
    });

    it('handles node IDs with special characters', async () => {
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

      expect(result.models).toHaveLength(5);
      result.models.forEach((model) => expectNode(model));

      const expectedIds = [
        'node-with-dashes',
        'node_with_underscores',
        'node.with.dots',
        'node with spaces',
        'node/with/slashes',
      ];
      expect(result.models.map((m) => m.id)).toEqual(expectedIds);
      expect(container.nodes).toHaveLength(5);
    });

    it('handles large numbers of models efficiently', async () => {
      const container = new DigraphModel('container');
      const nodeCount = 100; // Reduced for faster testing

      const LargeGraph = (): ReactElement => (
        <>
          {Array.from({ length: nodeCount }, (_, i) => {
            const nodeId = `node_${i}`;
            return <Node key={nodeId} id={nodeId} />;
          })}
        </>
      );

      const result = await render(<LargeGraph />, { container });

      expect(result.models).toHaveLength(nodeCount);
      result.models.forEach((model) => expectNode(model));

      expect(result.models[0].id).toBe('node_0');
      expect(result.models[nodeCount - 1].id).toBe(`node_${nodeCount - 1}`);
      expect(container.nodes).toHaveLength(nodeCount);
    });
  });

  describe('Model Type Validation', () => {
    it('works correctly with different container types', async () => {
      const graphContainer = new GraphModel('graph_container');
      const digraphContainer = new DigraphModel('digraph_container');

      // Test with undirected Graph container
      const result1 = await render(<Node id="in_graph" />, {
        container: graphContainer,
      });

      expect(result1.models).toHaveLength(1);
      expectNode(result1.models[0]);
      expect((result1.models[0] as NodeModel).id).toBe('in_graph');
      expect(graphContainer.directed).toBe(false);

      // Test with directed Digraph container
      const result2 = await render(<Node id="in_digraph" />, {
        container: digraphContainer,
      });

      expect(result2.models).toHaveLength(1);
      expectNode(result2.models[0]);
      expect((result2.models[0] as NodeModel).id).toBe('in_digraph');
      expect(digraphContainer.directed).toBe(true);
    });

    it('preserves all node attributes during collection', async () => {
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

      expect(result.models).toHaveLength(1);
      expectNode(result.models[0]);

      const node = result.models[0] as NodeModel;
      expect(node.id).toBe('test');
      expect(node.attributes.get('label')).toBe('Test Label');
      expect(node.attributes.get('shape')).toBe('circle');
      expect(node.attributes.get('color')).toBe('red');
      expect(node.attributes.get('style')).toBe('filled');
    });
  });
});
