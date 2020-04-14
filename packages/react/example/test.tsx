import React from 'react';
import { Context } from 'ts-graphviz';
import { Digraph, Node, Subgraph, toDot } from '../src';

const context = new Context();

const result = toDot(
  <Digraph>
    <Node id={'aa'} />

    <Subgraph id={'hoge'}>
      <Node id={'bbb'} />
    </Subgraph>
  </Digraph>,
  context,
);

console.log(result);
