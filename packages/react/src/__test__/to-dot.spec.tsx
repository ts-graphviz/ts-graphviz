import React from 'react';
import { Digraph } from '../components/Digraph';
import { Node } from '../components/Node';
import { toDot } from '../renderer/render';

describe('render', () => {
  it('render works', () => {
    const tree = toDot(
      <Digraph>
        <Node id={'a'} />
        <Node id={'b'} />
      </Digraph>,
    );
    expect(tree).toMatchSnapshot();
  });
});
