import {
  attribute as _,
  type ClusterSubgraphAttributesObject,
  digraph,
  type NonClusterSubgraphAttributesObject,
  type SubgraphAttributesFor,
  type SubgraphAttributesObject,
  type SubgraphModel,
} from 'ts-graphviz';
import { describe, expectTypeOf, it } from 'vitest';

// #1742: Graphviz draws a subgraph as a cluster when its id starts with
// "cluster" (or it has cluster=true), and ignores attributes that do not apply.
describe('subgraph attributes by id', () => {
  const g = digraph('G');

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

  it('takes cluster attributes on a cluster id', () => {
    expectTypeOf(
      g.subgraph('cluster_a', { [_.pencolor]: 'red', [_.label]: 'A' }),
    ).toEqualTypeOf<SubgraphModel>();
    g.createSubgraph('cluster_b', { bgcolor: 'lightgrey' });
    // @ts-expect-error rank applies to subgraphs that are not clusters
    g.subgraph('cluster_c', { rank: 'same' });
  });

  it('takes subgraph attributes on any other id', () => {
    g.subgraph('row', { rank: 'same' });
    g.createSubgraph('row2', { [_.rank]: 'min' });
    // @ts-expect-error pencolor applies to clusters
    g.subgraph('not_a_cluster', { pencolor: 'red' });
    // @ts-expect-error label applies to clusters
    g.createSubgraph('not_a_cluster', { label: 'x' });
    // @ts-expect-error "cluster" must start the id
    g.subgraph('my_cluster', { pencolor: 'red' });
  });

  it('takes cluster attributes with cluster: true, on any id or none', () => {
    g.subgraph('domestic_cats', { cluster: true, pencolor: 'red', label: 'x' });
    g.subgraph({ [_.cluster]: true, [_.color]: 'red' });
    g.createSubgraph({ cluster: true, label: 'x' });
    // @ts-expect-error rank does not apply once it is a cluster
    g.subgraph('s', { cluster: true, rank: 'same' });
  });

  it('applies the same rules to anonymous subgraphs', () => {
    g.subgraph({ rank: 'same' });
    g.createSubgraph({ rank: 'source' });
    // @ts-expect-error label applies to clusters
    g.subgraph({ label: 'x' });
  });

  it('keeps an id known only at run time as loose as before', () => {
    const id: string = `cluster_${Math.random()}`;
    g.subgraph(id, { pencolor: 'red', rank: 'same' });
    g.createSubgraph(id, { label: 'x' });
  });

  it('keeps the calls without attributes', () => {
    expectTypeOf(g.subgraph('a')).toEqualTypeOf<SubgraphModel>();
    expectTypeOf(
      g.subgraph('a', (s) => s.node('x')),
    ).toEqualTypeOf<SubgraphModel>();
    expectTypeOf(g.subgraph()).toEqualTypeOf<SubgraphModel>();
    expectTypeOf(g.createSubgraph()).toEqualTypeOf<SubgraphModel>();
    expectTypeOf(g.createSubgraph('a')).toEqualTypeOf<SubgraphModel>();
  });
});
