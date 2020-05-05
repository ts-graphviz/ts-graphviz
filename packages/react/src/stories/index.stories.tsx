import React, { FC } from 'react';
import { select, withKnobs } from '@storybook/addon-knobs';
import { Graphviz } from '../web';
import { Digraph, Node, Edge, Subgraph, DOT } from '../index';

export default { title: 'Graphviz', decorators: [withKnobs] };

export const Simple: FC = () => {
  const engine = select('engine', ['circo', 'dot', 'fdp', 'neato', 'osage', 'patchwork', 'twopi'], 'dot');
  return (
    <Graphviz
      engine={engine}
      dot={
        <Digraph>
          <Node id="n1" />
          <Node id="n2" />
          <Node id="n3" />
          <Edge targets={['n1', 'n2', 'n3']} />
          <Edge targets={['n1', 'n3']} />
        </Digraph>
      }
    />
  );
};

export const RenderDotString: FC = () => {
  const dot = 'digraph { a -> b -> c; a->c; }';
  return <Graphviz dot={dot} />;
};

export const FullExample: FC = () => (
  <Graphviz
    dot={
      <Digraph
        rankdir="TB"
        edge={{
          color: 'blue',
          fontcolor: 'blue',
        }}
        node={{
          shape: 'none',
        }}
      >
        <Node
          id="nodeA"
          shape="none"
          label={
            <DOT.TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
              <DOT.TR>
                <DOT.TD>left</DOT.TD>
                <DOT.TD PORT="m">middle</DOT.TD>
                <DOT.TD PORT="r">right</DOT.TD>
              </DOT.TR>
            </DOT.TABLE>
          }
        />
        <Subgraph id="cluster" label="Cluster" labeljust="l">
          <Node id="nodeB" label="This is label for nodeB." />
        </Subgraph>
        <Edge targets={['nodeB', 'nodeA:m']} comment="Edge from node A to B" label={<DOT.B>A to B</DOT.B>} />
      </Digraph>
    }
  />
);
