// tslint:disable: jsx-no-multiline-js
import React from 'react';
import { Context } from 'ts-graphviz';
import { Edge, Subgraph } from '../components';
import { Digraph } from '../components/Digraph';
import { Node } from '../components/Node';
import { toDot } from '../renderer/render';

describe('toDot', () => {
  let context: Context;
  beforeEach(() => {
    context = new Context();
  });
  it('render works', () => {
    const dot = toDot(
      <Digraph>
        <Node id={'a'} />
        <Node id={'b'} />
      </Digraph>,
      context,
    );
    expect(dot).toMatchSnapshot();
  });

  it('render edge', () => {
    const nodes = ['a', 'b'];
    const dot = toDot(
      <Digraph>
        {nodes.map(id => (
          <Node id={id} key={id} />
        ))}
        <Edge targets={nodes} />
      </Digraph>,
      context,
    );
    expect(dot).toMatchSnapshot();
  });

  it('render subgraph', () => {
    const nodes = ['a', 'b'];
    const dot = toDot(
      <Digraph>
        <Subgraph>
          {nodes.map(id => (
            <Node id={id} key={id} />
          ))}
          <Edge targets={nodes} />
        </Subgraph>
      </Digraph>,
      context,
    );
    expect(dot).toMatchSnapshot();
  });
});
