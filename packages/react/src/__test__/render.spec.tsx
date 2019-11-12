import React from 'react';
import { Digraph } from '../components/Digraph';
import { render } from '../render';

describe('render', () => {
  it('render works', () => {
    const tree = render(<Digraph />);
    expect(tree).toMatchSnapshot();
  });
});
