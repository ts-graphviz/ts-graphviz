import {
  digraph,
  isEdgeModel,
  isNodeModel,
  isRootGraphModel,
} from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Edge } from './components/Edge.js';
import { Node } from './components/Node.js';
import { createRoot } from './createRoot.js';

describe('README examples', () => {
  it('should work with type guard examples from README', async () => {
    const root = createRoot();

    await root.render(
      <Digraph id="myGraph" rankdir="LR">
        <Node id="A" shape="box" />
        <Node id="B" shape="circle" />
        <Edge targets={['A', 'B']} />
      </Digraph>,
    );

    // ✅ Type-safe model access
    const models = root.getTopLevelModels();
    expect(models).toHaveLength(1);

    // ✅ Type-safe filtering with built-in type guards
    // Get only nodes (properly typed as NodeModel[])
    const nodes = root.getTopLevelModels(isNodeModel);
    expect(nodes).toHaveLength(0); // In non-container mode, nodes are not at top level

    // Get only graphs (properly typed as RootGraphModel[])
    const graphs = root.getTopLevelModels(isRootGraphModel);
    expect(graphs).toHaveLength(1);
    expect(graphs[0].id).toBe('myGraph');

    root.unmount();
  });

  it('should work with container mode example from README', async () => {
    const container = digraph('myContainer');
    const root = createRoot({ container });

    await root.render(
      <>
        <Node id="node1" />
        <Node id="node2" />
        <Edge targets={['node1', 'node2']} />
      </>,
    );

    // Container mode: access all non-container models with type safety
    const allNodes = root.getTopLevelModels(isNodeModel); // NodeModel[]
    expect(allNodes).toHaveLength(2);
    expect(allNodes[0].id).toBe('node1');
    expect(allNodes[1].id).toBe('node2');

    const allEdges = root.getTopLevelModels(isEdgeModel); // EdgeModel[]
    expect(allEdges).toHaveLength(1);
    // Targets are NodeRef objects with id property
    expect(allEdges[0].targets).toHaveLength(2);
    expect(allEdges[0].targets[0].id).toBe('node1');
    expect(allEdges[0].targets[1].id).toBe('node2');

    // Type-safe operations
    allNodes.forEach((node) => {
      node.attributes.set('color', 'blue'); // TypeScript knows node attributes
    });

    allEdges.forEach((edge) => {
      const fromTo = `Edge from ${edge.targets[0].id} to ${edge.targets[1].id}`;
      expect(fromTo).toBe('Edge from node1 to node2');
    });

    root.unmount();
  });
});
