import {
  attr,
  createModelKit,
  defaultModelKit,
  defineSchema,
  isRootGraphModel,
  toDot,
} from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Edge } from './components/Edge.js';
import { Graph } from './components/Graph.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { createComponents } from './createComponents.js';
import { fromElement } from './fromElement.js';

const schema = defineSchema({
  node: { tier: attr<'core' | 'edge'>(), 'data-id': attr<number>() },
});

describe('createComponents()', () => {
  it('gives the components of the package, frozen', () => {
    const components = createComponents(createModelKit({ schema }));
    expect(components).toEqual({ Digraph, Graph, Subgraph, Node, Edge });
    expect(Object.isFrozen(components)).toBe(true);
    expect(createComponents(defaultModelKit)).toBe(components);
  });

  it('throws for something that is not a kit', () => {
    for (const value of [
      undefined,
      null,
      {},
      { schema },
      { createNode() {} },
    ]) {
      expect(() => createComponents(value as never)).toThrow(
        expect.objectContaining({
          name: 'TypeError',
          code: 'TSG_ERR_NOT_A_MODEL_KIT',
        }),
      );
    }
  });

  it('renders the attributes of the schema with the kit of the root', async () => {
    const C = createComponents(createModelKit({ schema }));
    const dot = await fromElement(
      <C.Digraph id="G">
        <C.Node id="a" tier="core" data-id={1} />
      </C.Digraph>,
      { models: { schema } },
    );
    const [G] = dot.graphs;
    expect(isRootGraphModel(G)).toBe(true);
    expect(toDot(G)).toContain('tier = "core"');
    expect(toDot(G)).toContain('"data-id" = 1');
  });
});
