import React, { FC, useState, useEffect } from 'react';
import { Graphviz } from './Graphviz';
import { Digraph } from '../components/Digraph';
import { Node } from '../components/Node';
import { Edge } from '../components/Edge';
import { Subgraph } from '../components/Subgraph';
import { DOT } from '../components/HtmlLike';

export default { title: 'Graphviz' };

export const Example: FC = () => (
  <Graphviz>
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
  </Graphviz>
);

const shapes = [
  'box',
  'polygon',
  'ellipse',
  'oval',
  'circle',
  'egg',
  'triangle',
  'parallelogram',
  'house',
  'pentagon',
  'hexagon',
];

export const CircoAnime: FC = () => {
  const [nodes, setNodes] = useState<string[]>(['n0', 'n1']);
  const [i, setI] = useState<number>(2);
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes([...nodes, `n${i}`]);
      setI(i + 1);
    }, 2000);
    return (): void => {
      clearInterval(interval);
    };
  }, [nodes, i, setNodes, setI]);
  return (
    <Graphviz engine="circo">
      <Digraph>
        {nodes.map((n, j) => (
          <Node id={n} key={n} shape={shapes[j % shapes.length]} />
        ))}
        <Edge targets={nodes} />
        <Edge targets={[`n${i - 1}`, 'n0']} />
      </Digraph>
    </Graphviz>
  );
};
