import React from 'react';
import { render } from '@testing-library/react';
import { Graphviz } from '../Graphviz';
import { Engine, Format, Image } from '../../hooks/rendered';
import { Digraph } from '../../../components/Digraph';
import { Node } from '../../../components/Node';
import { Edge } from '../../../components/Edge';

jest.mock('../../hooks/rendered', () => {
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
  test('render dot string', () => {
    const dot = 'digraph { a -> b -> c; a->c; }';
    const { container } = render(<Graphviz dot={dot} />);
    expect(container).toMatchSnapshot();
  });

  test('render dot element', () => {
    const { container } = render(
      <Graphviz
        dot={
          <Digraph>
            <Node id="n1" />
            <Node id="n2" />
            <Node id="n3" />
            <Edge targets={['n1', 'n2', 'n3']} />
            <Edge targets={['n1', 'n3']} />
          </Digraph>
        }
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
