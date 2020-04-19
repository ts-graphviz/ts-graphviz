// tslint:disable: jsx-no-multiline-js
import React from 'react';
import { Edge } from '../../components/Edge';
import { Subgraph } from '../../components/Subgraph';
import { Digraph } from '../../components/Digraph';
import { Node } from '../../components/Node';
import { renderToDot } from '../render';

describe('toDot', () => {
  it('render works', () => {
    const dot = renderToDot(
      <Digraph>
        <Node id="a" />
        <Node id="b" />
      </Digraph>,
    );
    expect(dot).toMatchSnapshot();
  });

  it('render edge', () => {
    const nodes = ['a', 'b'];
    const dot = renderToDot(
      <Digraph>
        {nodes.map(id => (
          <Node id={id} key={id} />
        ))}
        <Edge targets={nodes} />
      </Digraph>,
    );
    expect(dot).toMatchSnapshot();
  });

  it('render subgraph', () => {
    const nodes = ['a', 'b'];
    const dot = renderToDot(
      <Digraph>
        <Subgraph>
          {nodes.map(id => (
            <Node id={id} key={id} />
          ))}
          <Edge targets={nodes} />
        </Subgraph>
      </Digraph>,
    );
    expect(dot).toMatchSnapshot();
  });
});
