import React from 'react';
import { Digraph, Node, Subgraph, toDot } from '../src';

const result = toDot(
  <Digraph>
    <Node id={'aa'} />

    <Subgraph id={'hoge'}>
      <Node id={'bbb'} />
    </Subgraph>
  </Digraph>,
);

console.log({ result });
