import React, { FC, useState, useEffect } from 'react';
import { Graphviz } from '../web';
import { Digraph, Node, Edge } from '../index';

export default { title: 'Graphviz/Animations' };

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
