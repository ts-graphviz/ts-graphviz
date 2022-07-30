// tslint:disable: jsx-no-multiline-js
import React from 'react';
import 'jest-graphviz';
import { Edge } from '../../components/Edge';
import { Subgraph } from '../../components/Subgraph';
import { Digraph } from '../../components/Digraph';
import { Node } from '../../components/Node';
import { renderToDot } from '../render';

describe('renderToDot', () => {
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
    const dot = renderToDot(
      <Digraph>
        {['a', 'b'].map((id) => (
          <Node id={id} key={id} />
        ))}
        <Edge targets={['a', 'b']} />
      </Digraph>,
    );
    expect(dot).toMatchSnapshot();
  });

  it('render subgraph', () => {
    const dot = renderToDot(
      <Digraph>
        <Subgraph>
          {['a', 'b'].map((id) => (
            <Node id={id} key={id} />
          ))}
          <Edge targets={['a', 'b']} />
        </Subgraph>
      </Digraph>,
    );
    expect(dot).toMatchSnapshot();
  });

  it('render to be blank string', () => {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    const dot = renderToDot(<></>);
    expect(dot).toBe('');
  });
});
