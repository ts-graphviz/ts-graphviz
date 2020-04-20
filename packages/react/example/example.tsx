import React, { FC } from 'react';
import { Digraph, Node, Subgraph, renderToDot, Edge } from '../src';

const Example: FC = () => (
  <Digraph dpi={150}>
    <Node id="nodeA" />

    <Subgraph id="cluster" label="Cluster" labeljust="l">
      <Node id="nodeB" label="This is label for nodeB." />
    </Subgraph>
    <Edge targets={['nodeA', 'nodeB']} comment="Edge from node A to B" label={<b>A to B</b>} />
  </Digraph>
);

const dot = renderToDot(<Example />);

// eslint-disable-next-line no-console
console.log(dot);
