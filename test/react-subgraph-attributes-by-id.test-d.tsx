import {
  Subgraph,
  type SubgraphOptions,
  type SubgraphProps,
} from '@ts-graphviz/react';
import { describe, expectTypeOf, it } from 'vitest';

// #1742: <Subgraph>'s id picks its attributes, as for subgraph().
describe('<Subgraph> attributes by id', () => {
  it('takes cluster attributes and a React label on a cluster id', () => {
    <Subgraph id="cluster_a" pencolor="red" label="A" />;
    <Subgraph id="CLUSTER_b" label={<dot:b>B</dot:b>} />;
    // @ts-expect-error rank applies to subgraphs that are not clusters
    <Subgraph id="cluster_c" rank="same" />;
  });

  it('takes subgraph attributes on any other id', () => {
    <Subgraph id="row" rank="same" />;
    // @ts-expect-error pencolor applies to clusters
    <Subgraph id="row" pencolor="red" />;
    // @ts-expect-error label applies to clusters
    <Subgraph id="row" label="x" />;
  });

  it('takes cluster attributes with cluster, on any id or none', () => {
    <Subgraph id="domestic_cats" cluster={true} label="Cats" pencolor="red" />;
    <Subgraph cluster={true} label={<dot:i>anonymous</dot:i>} />;
    <Subgraph rank="same" />;
    // @ts-expect-error label applies to clusters
    <Subgraph label="x" />;
  });

  it('keeps an id known only at run time as loose as before', () => {
    const id: string = `cluster_${Math.random()}`;
    <Subgraph id={id} label="x" rank="same" />;
    const props: SubgraphProps = { id, label: 'x' };
    <Subgraph {...props} />;
  });

  it('keeps the shared props', () => {
    <Subgraph
      id="row"
      node={{ shape: 'box' }}
      edge={{ color: 'red' }}
      comment="c"
    />;
  });

  it('keeps the options without a type argument loose', () => {
    expectTypeOf<SubgraphOptions>().toMatchTypeOf<{ id?: string }>();
    const options: SubgraphOptions = {
      id: 'row',
      pencolor: 'red',
      rank: 'same',
    };
    expectTypeOf(options).toMatchTypeOf<SubgraphOptions>();
  });
});
