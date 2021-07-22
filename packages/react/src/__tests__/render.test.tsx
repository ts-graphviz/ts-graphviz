/* eslint-disable jest/expect-expect */
import React from 'react';
import 'jest-graphviz';
import { digraph, toDot } from 'ts-graphviz';
import { Edge } from '../components/Edge';
import { Node } from '../components/Node';
import { renderExpectToThrow } from '../components/__tests__/utils/renderExpectToThrow';
import { NoContainerErrorMessage } from '../errors';
import { render } from '../render';

describe('renderToDot', () => {
  describe('no container error', () => {
    test('Fragment', () => {
      renderExpectToThrow(<></>, NoContainerErrorMessage);
    });

    test('Node', () => {
      renderExpectToThrow(<Node id="test" />, NoContainerErrorMessage);
    });

    test('Edge', () => {
      renderExpectToThrow(<Edge targets={['a', 'b']} />, NoContainerErrorMessage);
    });
  });

  it('render to container subgraph test', () => {
    const nodes = ['a', 'b'];
    const G = digraph();
    const subgraph = render(
      <>
        {nodes.map((id) => (
          <Node id={id} key={id} />
        ))}
        <Edge targets={nodes} />
      </>,
      G.subgraph('test'),
    );
    expect(G.subgraph('test')).toEqual(subgraph);
    expect(toDot(G)).toBeValidDotAndMatchSnapshot();
  });
});
