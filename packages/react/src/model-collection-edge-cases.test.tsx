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
import { createRoot } from './createRoot.js';
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
      const root = createRoot(container);

      await root.render(
        <>
          <Node id="first" />
          <Subgraph id="second">
            <Node id="third" />
          </Subgraph>
          <Node id="fourth" />
          <Edge targets={['first', 'fourth']} />
        </>,
      );

      const models = root.getTopLevelModels();
      // All models should be collected (including nested ones)
      expect(models).toHaveLength(5); // first Node, third Node (from subgraph), Subgraph, fourth Node, Edge
      expectModelsToContainTypes(models, ['Node', 'Subgraph', 'Edge']);

      // Verify first model is the first created
      expectNode(models[0]);
      expect((models[0] as NodeModel).id).toBe('first');

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
      const root = createRoot(container);

      await root.render(
        <>
          <Node id="a" />
          <Node id="b" />
          <Node id="c" />
        </>,
      );

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(3);
      expect(models.map((m) => m.id)).toEqual(['a', 'b', 'c']);
      models.forEach((model) => expectNode(model));
      expect(container.nodes).toHaveLength(3);
    });

    it('collects nested models before sibling models', async () => {
      const container = new DigraphModel('container');
      const root = createRoot(container);

      await root.render(
        <>
          <Subgraph id="nested">
            <Node id="deep" />
          </Subgraph>
          <Node id="direct" />
        </>,
      );

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(3); // Node, Subgraph, Node
      expectNode(models[0]);
      expect((models[0] as NodeModel).id).toBe('deep');

      const subgraphModel = expectModelWithId(models, 'nested');
      const directModel = expectModelWithId(models, 'direct');
      expect(subgraphModel).toBeDefined();
      expect(directModel).toBeDefined();
    });
  });

  describe('Duplicate ID Handling', () => {
    it('handles duplicate node IDs by overwriting in container', async () => {
      const container = new DigraphModel('container');
      const root = createRoot(container);

      await root.render(
        <>
          <Node id="duplicate" label="First" />
          <Node id="duplicate" label="Second" />
        </>,
      );

      const models = root.getTopLevelModels();
      // Both models are collected during render
      expect(models).toHaveLength(2);
      models.forEach((model) => expectNode(model));
      expect(models[0].id).toBe('duplicate');
      expect(models[1].id).toBe('duplicate');

      // Container has the final (overwritten) version
      expect(container.nodes).toHaveLength(1);
      expect(container.nodes[0].attributes.get('label')).toBe('Second');
    });

    it('handles nodes with undefined IDs correctly', async () => {
      const container = new DigraphModel('container');
      const root = createRoot(container);

      await root.render(
        <>
          <Node id={undefined as any} />
          <Node id="defined" />
        </>,
      );

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(2);
      models.forEach((model) => expectNode(model));

      expect(models[0].id).toBeUndefined();
      expect(models[1].id).toBe('defined');
      expect(container.nodes).toHaveLength(2);
    });

    it('handles nodes with empty string IDs correctly', async () => {
      const container = new DigraphModel('container');
      const root = createRoot(container);

      await root.render(
        <>
          <Node id="" />
          <Node id="normal" />
        </>,
      );

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(2);
      models.forEach((model) => expectNode(model));

      expect(models[0].id).toBe('');
      expect(models[1].id).toBe('normal');
      expect(container.nodes).toHaveLength(2);
    });
  });

  describe('Complex Nested Structures', () => {
    it('collects all models from deeply nested subgraph hierarchy', async () => {
      const container = new DigraphModel('root');
      const root = createRoot(container);

      await root.render(
        <Subgraph id="level1">
          <Subgraph id="level2">
            <Subgraph id="level3">
              <Node id="deepest" />
            </Subgraph>
          </Subgraph>
        </Subgraph>,
      );

      const models = root.getTopLevelModels();
      // All nested models should be collected
      expect(models).toHaveLength(4); // Node + 3 Subgraphs
      expectModelsToContainTypes(models, ['Node', 'Subgraph']);

      const deepestNode = expectModelWithId(models, 'deepest');
      expectNode(deepestNode);

      // Verify nested structure in container
      expect(container.subgraphs).toHaveLength(1);
      expect(container.subgraphs[0].subgraphs).toHaveLength(1);
      expect(container.subgraphs[0].subgraphs[0].subgraphs).toHaveLength(1);
    });

    it('renders differently with and without containers', async () => {
      // Without container - collects only the root graph (not its children)
      const root1 = createRoot();
      await root1.render(
        <Digraph id="root">
          <Node id="in_root" />
        </Digraph>,
      );

      const models1 = root1.getTopLevelModels();
      expect(models1).toHaveLength(1); // Only the root Graph
      expectGraph(models1[0]);
      expect(models1[0].id).toBe('root');

      // With container - collects only rendered models
      const container = new DigraphModel('container');
      const root2 = createRoot(container);
      await root2.render(<Node id="in_container" />);

      const models2 = root2.getTopLevelModels();
      expect(models2).toHaveLength(1);
      expectNode(models2[0]);
      expect((models2[0] as NodeModel).id).toBe('in_container');
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
      const root1 = createRoot(container1);
      await root1.render(<ConditionalComponent showFirst={true} />);

      const models1 = root1.getTopLevelModels();
      expect(models1).toHaveLength(2);
      expect(models1.map((m) => m.id)).toEqual([
        'conditional_first',
        'always_second',
      ]);
      models1.forEach((model) => expectNode(model));
      expect(container1.nodes).toHaveLength(2);

      // Test with first condition false
      const container2 = new DigraphModel('container2');
      const root2 = createRoot(container2);
      await root2.render(<ConditionalComponent showFirst={false} />);

      const models2 = root2.getTopLevelModels();
      expect(models2).toHaveLength(2);
      expect(models2.map((m) => m.id)).toEqual([
        'always_second',
        'conditional_last',
      ]);
      models2.forEach((model) => expectNode(model));
      expect(container2.nodes).toHaveLength(2);
    });
  });

  describe('Special Component Cases', () => {
    it('handles components that render null', async () => {
      const container = new DigraphModel('container');
      const root = createRoot(container);

      const NullComponent = (): ReactElement | null => null;

      await root.render(
        <>
          <NullComponent />
          <Node id="after_null" />
        </>,
      );

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(1);
      expectNode(models[0]);
      expect((models[0] as NodeModel).id).toBe('after_null');
      expect(container.nodes).toHaveLength(1);
    });

    it('handles React fragments and mapped JSX elements', async () => {
      const container = new DigraphModel('container');
      const root = createRoot(container);

      await root.render(
        <>
          <Node id="in_fragment1" />
          <React.Fragment>
            <Node id="in_fragment2" />
          </React.Fragment>
          {[1, 2, 3].map((n) => (
            <Node key={`node-${n}`} id={`mapped_${n}`} />
          ))}
        </>,
      );

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(5);
      models.forEach((model) => expectNode(model));

      const expectedIds = [
        'in_fragment1',
        'in_fragment2',
        'mapped_1',
        'mapped_2',
        'mapped_3',
      ];
      expect(models.map((m) => m.id)).toEqual(expectedIds);
      expect(container.nodes).toHaveLength(5);
    });

    it('handles multiple separate render operations correctly', async () => {
      const containers = [
        new DigraphModel('container1'),
        new DigraphModel('container2'),
        new DigraphModel('container3'),
      ];

      const roots = containers.map((container) => createRoot(container));

      await Promise.all([
        roots[0].render(<Node id="render1" />),
        roots[1].render(<Node id="render2" />),
        roots[2].render(<Node id="render3" />),
      ]);

      roots.forEach((root, index) => {
        const models = root.getTopLevelModels();
        expect(models).toHaveLength(1);
        expectNode(models[0]);
        expect((models[0] as NodeModel).id).toBe(`render${index + 1}`);
        expect(containers[index].nodes).toHaveLength(1);
        expect(containers[index].nodes[0].id).toBe(`render${index + 1}`);
      });
    });

    it('handles node IDs with special characters', async () => {
      const container = new DigraphModel('container');
      const root = createRoot(container);

      await root.render(
        <>
          <Node id="node-with-dashes" />
          <Node id="node_with_underscores" />
          <Node id="node.with.dots" />
          <Node id="node with spaces" />
          <Node id="node/with/slashes" />
        </>,
      );

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(5);
      models.forEach((model) => expectNode(model));

      const expectedIds = [
        'node-with-dashes',
        'node_with_underscores',
        'node.with.dots',
        'node with spaces',
        'node/with/slashes',
      ];
      expect(models.map((m) => m.id)).toEqual(expectedIds);
      expect(container.nodes).toHaveLength(5);
    });

    it('handles large numbers of models efficiently', async () => {
      const container = new DigraphModel('container');
      const root = createRoot(container);
      const nodeCount = 100; // Reduced for faster testing

      const LargeGraph = (): ReactElement => (
        <>
          {Array.from({ length: nodeCount }, (_, i) => {
            const nodeId = `node_${i}`;
            return <Node key={nodeId} id={nodeId} />;
          })}
        </>
      );

      await root.render(<LargeGraph />);

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(nodeCount);
      models.forEach((model) => expectNode(model));

      expect(models[0].id).toBe('node_0');
      expect(models[nodeCount - 1].id).toBe(`node_${nodeCount - 1}`);
      expect(container.nodes).toHaveLength(nodeCount);
    });
  });

  describe('Model Type Validation', () => {
    it('works correctly with different container types', async () => {
      const graphContainer = new GraphModel('graph_container');
      const digraphContainer = new DigraphModel('digraph_container');

      // Test with undirected Graph container
      const root1 = createRoot(graphContainer);
      await root1.render(<Node id="in_graph" />);

      const models1 = root1.getTopLevelModels();
      expect(models1).toHaveLength(1);
      expectNode(models1[0]);
      expect((models1[0] as NodeModel).id).toBe('in_graph');
      expect(graphContainer.directed).toBe(false);

      // Test with directed Digraph container
      const root2 = createRoot(digraphContainer);
      await root2.render(<Node id="in_digraph" />);

      const models2 = root2.getTopLevelModels();
      expect(models2).toHaveLength(1);
      expectNode(models2[0]);
      expect((models2[0] as NodeModel).id).toBe('in_digraph');
      expect(digraphContainer.directed).toBe(true);
    });

    it('preserves all node attributes during collection', async () => {
      const container = new DigraphModel('container');
      const root = createRoot(container);

      await root.render(
        <Node
          id="test"
          label="Test Label"
          shape="circle"
          color="red"
          style="filled"
        />,
      );

      const models = root.getTopLevelModels();
      expect(models).toHaveLength(1);
      expectNode(models[0]);

      const node = models[0] as NodeModel;
      expect(node.id).toBe('test');
      expect(node.attributes.get('label')).toBe('Test Label');
      expect(node.attributes.get('shape')).toBe('circle');
      expect(node.attributes.get('color')).toBe('red');
      expect(node.attributes.get('style')).toBe('filled');
    });
  });
});
