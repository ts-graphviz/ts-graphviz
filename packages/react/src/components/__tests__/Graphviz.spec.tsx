import React from 'react';
import { render } from '@testing-library/react';
import { Graphviz } from '../Graphviz';
import { Engine, Format, Image } from '../../hooks/use-rendered';
import { Digraph } from '../Digraph';
import { Node } from '../Node';
import { Edge } from '../Edge';

jest.mock('../../hooks/use-rendered', () => {
  return {
    useRendered: (
      dot: string,
      engine?: Engine,
      format?: Format,
      ext?: {
        images?: Image[];
        files?: File[];
      },
    ): string => JSON.stringify({ dot, engine, format, ext }),
  };
});

describe('Graphviz component', () => {
  test('render dot element', () => {
    const { container } = render(
      <Graphviz>
        <Digraph>
          <Node id="n1" />
          <Node id="n2" />
          <Node id="n3" />
          <Edge targets={['n1', 'n2', 'n3']} />
          <Edge targets={['n1', 'n3']} />
        </Digraph>
      </Graphviz>,
    );
    expect(container).toMatchSnapshot();
  });
});
