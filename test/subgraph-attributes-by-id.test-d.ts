import {
  type ClusterSubgraphAttributesObject,
  type ClusterSubgraphId,
  type DSL,
  defaultModelKit,
  digraph,
  type NonClusterSubgraphAttributesObject,
  Subgraph,
  type SubgraphAttributesFor,
  type SubgraphAttributesObject,
  type SubgraphConstructor,
  type SubgraphModel,
} from 'ts-graphviz';
import { describe, expectTypeOf, it } from 'vitest';

// Graphviz draws a subgraph as a cluster when its id starts with
// "cluster" (or it has cluster=true), and ignores attributes that do not
// apply. The attributes of a subgraph are statements of its body, so the id
// picks them only where an object of them goes with an id, as the props of
// @ts-graphviz/react's <Subgraph> do.
describe('subgraph attributes by id', () => {
  it('picks the attribute object from the id', () => {
    expectTypeOf<
      SubgraphAttributesFor<'cluster_a'>
    >().toEqualTypeOf<ClusterSubgraphAttributesObject>();
    expectTypeOf<
      SubgraphAttributesFor<'cluster'>
    >().toEqualTypeOf<ClusterSubgraphAttributesObject>();
    expectTypeOf<
      SubgraphAttributesFor<'a'>
    >().toEqualTypeOf<NonClusterSubgraphAttributesObject>();
    expectTypeOf<
      SubgraphAttributesFor<string>
    >().toEqualTypeOf<SubgraphAttributesObject>();
  });

  it('matches the "cluster" prefix in any case, as Graphviz does', () => {
    expectTypeOf<'cLUSTEr'>().toExtend<ClusterSubgraphId>();
    expectTypeOf<'ClUsTeR_d'>().toExtend<ClusterSubgraphId>();
    expectTypeOf<'clustr_a'>().not.toExtend<ClusterSubgraphId>();
    expectTypeOf<'_cluster'>().not.toExtend<ClusterSubgraphId>();
    expectTypeOf<'cluste'>().not.toExtend<ClusterSubgraphId>();
    expectTypeOf<string>().not.toExtend<ClusterSubgraphId>();
  });
});

describe('a subgraph takes an id only', () => {
  const g = digraph('G');

  it('in the DSL, with its attributes in the callback', () => {
    expectTypeOf(g.subgraph('a')).toEqualTypeOf<DSL<SubgraphModel>>();
    expectTypeOf(
      g.subgraph('cluster_a', (s) => {
        s.label = 'A';
        s.pencolor = 'red';
      }),
    ).toEqualTypeOf<DSL<SubgraphModel>>();
    expectTypeOf(g.subgraph()).toEqualTypeOf<DSL<SubgraphModel>>();
    // @ts-expect-error as in DOT, no attributes in the header
    g.subgraph('cluster_a', { label: 'A' });
    // @ts-expect-error nor for an anonymous one
    g.subgraph({ rank: 'same' });
  });

  it('from a kit, a constructor and SubgraphConstructor', () => {
    expectTypeOf(
      defaultModelKit.createSubgraph('a'),
    ).toEqualTypeOf<SubgraphModel>();
    expectTypeOf(
      defaultModelKit.createSubgraph(),
    ).toEqualTypeOf<SubgraphModel>();
    new Subgraph('cluster_a');
    const C: SubgraphConstructor = Subgraph;
    new C('row');
    // @ts-expect-error no attributes
    defaultModelKit.createSubgraph('cluster_b', { bgcolor: 'lightgrey' });
    // @ts-expect-error no attributes
    new Subgraph('row', { rank: 'same' });
    // @ts-expect-error no attributes
    new C({ cluster: true });
  });
});
