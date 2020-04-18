import React from 'react';
import { Context } from 'ts-graphviz';
import { Digraph, Node, Subgraph, renderToDot, Edge } from '../src';

const context = new Context();

const result = renderToDot(
  <Digraph>
    <Node id="aa" />

    <Subgraph id="hoge">
      <Node id="bbb" label="aaa" />
    </Subgraph>
    <Edge targets={['aa', 'bbb']} comment="aaaaa" label={<b>aaa</b>} />
  </Digraph>,
  context,
);

// eslint-disable-next-line no-console
console.log(result);
