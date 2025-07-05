import {
  digraph,
  isEdgeModel,
  isNodeModel,
  isRootGraphModel,
  isSubgraphModel,
} from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Edge } from './components/Edge.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { createRoot } from './createRoot.js';

describe('createRoot type guards', () => {
  it('should filter models by type using type guards (non-container mode)', async () => {
    const root = createRoot();

    await root.render(
      <Digraph id="test-graph">
        <Node id="node1" />
        <Node id="node2" />
        <Edge targets={['node1', 'node2']} />
        <Subgraph id="sub1">
          <Node id="node3" />
        </Subgraph>
      </Digraph>,
    );

    // In non-container mode, only root graph models are collected
    const nodes = root.getTopLevelModels(isNodeModel);
    expect(nodes).toHaveLength(0); // No nodes at top level

    const edges = root.getTopLevelModels(isEdgeModel);
    expect(edges).toHaveLength(0); // No edges at top level

    const subgraphs = root.getTopLevelModels(isSubgraphModel);
    expect(subgraphs).toHaveLength(0); // No subgraphs at top level

    // Only the root graph is collected
    const graphs = root.getTopLevelModels(isRootGraphModel);
    expect(graphs).toHaveLength(1);
    expect(graphs[0].id).toBe('test-graph');

    root.unmount();
  });

  it('should work with container mode', async () => {
    const container = digraph('container');
    const root = createRoot({ container });

    await root.render(
      <>
        <Node id="node1" />
        <Node id="node2" />
        <Edge targets={['node1', 'node2']} />
      </>,
    );

    // In container mode, only non-container models are returned
    const nodes = root.getTopLevelModels(isNodeModel);
    expect(nodes).toHaveLength(2);

    const edges = root.getTopLevelModels(isEdgeModel);
    expect(edges).toHaveLength(1);

    // Container itself should not be included
    const graphs = root.getTopLevelModels(isRootGraphModel);
    expect(graphs).toHaveLength(0);

    root.unmount();
  });

  it('should return empty array when no models match type guard', async () => {
    const root = createRoot();

    await root.render(
      <Digraph id="test-graph">
        <Node id="node1" />
      </Digraph>,
    );

    // No edges in this graph
    const edges = root.getTopLevelModels(isEdgeModel);
    expect(edges).toHaveLength(0);

    // No subgraphs in this graph
    const subgraphs = root.getTopLevelModels(isSubgraphModel);
    expect(subgraphs).toHaveLength(0);

    root.unmount();
  });

  it('should return all models when no type guard is provided', async () => {
    const root = createRoot();

    await root.render(
      <Digraph id="test-graph">
        <Node id="node1" />
        <Edge targets={['node1', 'node1']} />
      </Digraph>,
    );

    // In non-container mode, only root graph is returned
    const allModels = root.getTopLevelModels();
    expect(allModels).toHaveLength(1); // Only the digraph

    root.unmount();
  });
});
