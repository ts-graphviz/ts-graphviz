import React, { FC } from 'react';
import { Digraph, Node, Subgraph, renderToDot, Edge } from '../src';

const Sample: FC = () => (
  <Digraph>
    <Node id="aa" />

    <Subgraph id="hoge">
      <Node id="bbb" label="aaa" />
    </Subgraph>
    <Edge targets={['aa', 'bbb']} comment="aaaaa" label={<b>aaa</b>} />
  </Digraph>
);

const dot = renderToDot(<Sample />);

// eslint-disable-next-line no-console
console.log(dot);
