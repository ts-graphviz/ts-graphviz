import { createRoot } from '@ts-graphviz/react';
import {
  type AnyDotObjectModel,
  type AttributeListModel,
  type DotModel,
  type DotObjectModel,
  type EdgeModel,
  isNodeModel,
  type NodeModel,
  type RootGraphModel,
  type SubgraphModel,
  toDot,
} from 'ts-graphviz';
import { describe, expectTypeOf, it } from 'vitest';

// #1740: a union of the concrete models, discriminated by `$$type`.
describe('AnyDotObjectModel', () => {
  it('narrows on $$type', () => {
    const describe = (model: AnyDotObjectModel) => {
      switch (model.$$type) {
        case 'Node':
          expectTypeOf(model).toEqualTypeOf<NodeModel>();
          return model.id;
        case 'Edge':
          expectTypeOf(model).toEqualTypeOf<EdgeModel>();
          return model.targets.length;
        case 'Subgraph':
          expectTypeOf(model).toEqualTypeOf<SubgraphModel>();
          return model.id;
        case 'Graph':
          expectTypeOf(model).toEqualTypeOf<RootGraphModel>();
          return model.directed;
        case 'AttributeList':
          expectTypeOf(model).toEqualTypeOf<AttributeListModel>();
          return model.$$kind;
        case 'Dot':
          expectTypeOf(model).toEqualTypeOf<DotModel>();
          return model.graphs.length;
        default:
          expectTypeOf(model).toBeNever();
          return model;
      }
    };
    void describe;
  });

  it('is a DotObjectModel, so it goes wherever one is accepted', () => {
    expectTypeOf<AnyDotObjectModel>().toMatchTypeOf<DotObjectModel>();
    const model = {} as AnyDotObjectModel;
    toDot(model);
  });
});

describe('@ts-graphviz/react createRoot', () => {
  it('returns concrete models', () => {
    const root = createRoot({
      onRenderComplete(models) {
        expectTypeOf(models).toEqualTypeOf<AnyDotObjectModel[]>();
      },
    });
    const models = root.getTopLevelModels();
    expectTypeOf(models).toEqualTypeOf<AnyDotObjectModel[]>();
    const first = models[0];
    if (first?.$$type === 'Graph') {
      expectTypeOf(first).toEqualTypeOf<RootGraphModel>();
    }
    // A type guard still filters, and a callback typed for DotObjectModel still fits.
    expectTypeOf(root.getTopLevelModels(isNodeModel)).toEqualTypeOf<
      NodeModel[]
    >();
    createRoot({ onRenderComplete: (all: DotObjectModel[]) => void all });
  });
});
