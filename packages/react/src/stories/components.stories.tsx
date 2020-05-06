/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { FC } from 'react';
import { withKnobs, text, select, number } from '@storybook/addon-knobs';
import { Graphviz, Digraph, Graph, Node, Edge } from '../index';

export default { title: 'Graphviz/Components', decorators: [withKnobs] };

export const RootGraph: FC = () => {
  const root = select('root', ['digraph', 'graph'], 'digraph');
  const Root = root === 'digraph' ? Digraph : Graph;
  const rankdir = select('rankdir', ['TB', 'BT', 'RL', 'LR'], 'TB');
  return (
    <Graphviz>
      <Root rankdir={rankdir}>
        <Node id="n1" />
        <Node id="n2" />
        <Node id="n3" />
        <Edge targets={['n1', 'n2', 'n3']} />
        <Edge targets={['n1', 'n3']} />
      </Root>
    </Graphviz>
  );
};

export const NodeSample: FC = () => {
  return (
    <Graphviz>
      <Digraph>
        <Node
          id="n"
          label={text('label', 'label')}
          xlabel={text('xlabel', '')}
          color={text('color', 'black')}
          fillcolor={text('fillcolor', 'yellow')}
          style={text('style', 'filled')}
          shape={select(
            'shape',
            [
              'box',
              'assembly',
              'box3d',
              'cds',
              'circle',
              'component',
              'cylinder',
              'diamond',
              'doublecircle',
              'doubleoctagon',
              'egg',
              'ellipse',
              'fivepoverhang',
              'folder',
              'hexagon',
              'house',
              'insulator',
              'invhouse',
              'invtrapezium',
              'invtriangle',
              'larrow',
              'lpromoter',
              'Mcircle',
              'Mdiamond',
              'Msquare',
              'none',
              'note',
              'noverhang',
              'octagon',
              'oval',
              'parallelogram',
              'pentagon',
              'plain',
              'plaintext',
              'point',
              'polygon',
              'primersite',
              'promoter',
              'proteasesite',
              'proteinstab',
              'rarrow',
              'rect',
              'rectangle',
              'restrictionsite',
              'ribosite',
              'rnastab',
              'rpromoter',
              'septagon',
              'signature',
              'square',
              'star',
              'tab',
              'terminator',
              'threepoverhang',
              'trapezium',
              'triangle',
              'tripleoctagon',
              'underline',
              'utr',
            ],
            'box',
          )}
        />
      </Digraph>
    </Graphviz>
  );
};

export const EdgeSample: FC = () => {
  return (
    <Graphviz>
      <Digraph>
        <Node id="n1" />
        <Node id="n2" />
        <Edge
          targets={['n1', 'n2']}
          label={text('label', 'label')}
          dir={select('dir', ['forward', 'back', 'both'], 'forward')}
          arrowhead={select(
            'arrowhead',
            ['box', 'crow', 'curve', 'icurve', 'diamond', 'dot', 'inv', 'none', 'normal', 'tee', 'vee'],
            'normal',
          )}
          arrowtail={select(
            'arrowtail',
            ['box', 'crow', 'curve', 'icurve', 'diamond', 'dot', 'inv', 'none', 'normal', 'tee', 'vee'],
            'normal',
          )}
          arrowsize={number('arrowsize', 1, { min: 0, step: 0.1 })}
        />
      </Digraph>
    </Graphviz>
  );
};
