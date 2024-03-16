import { renderHTMLLike } from '@ts-graphviz/react';
import { digraph } from '../packages/ts-graphviz/src/model-factory.js';

function FactoryFnLabel() {
  return (
    <dot:table>
      <dot:tr>
        <dot:td BGCOLOR="#f0f0f0" ALIGN="CENTER">
          Model Factory Functions
        </dot:td>
      </dot:tr>
      <dot:tr>
        <dot:td PORT="description" ALIGN="LEFT">
          strict.digraph(...)
          <dot:br ALIGN="LEFT" />
          strict.graph(...)
          <dot:br ALIGN="LEFT" />
          digraph(...)
          <dot:br ALIGN="LEFT" />
          graph(...)
          <dot:br ALIGN="LEFT" />
        </dot:td>
      </dot:tr>
    </dot:table>
  );
}

function OOPLabel() {
  return (
    <dot:table>
      <dot:tr>
        <dot:td BGCOLOR="#f0f0f0" ALIGN="CENTER">
          Object-Oriented Programming
        </dot:td>
      </dot:tr>
      <dot:tr>
        <dot:td PORT="description" ALIGN="LEFT">
          new Digraph(...)
          <dot:br ALIGN="LEFT" />
          new Graph(...)
          <dot:br ALIGN="LEFT" />
          ...
          <dot:br ALIGN="LEFT" />
        </dot:td>
      </dot:tr>
    </dot:table>
  );
}

export default digraph((g) => {
  g.set('rankdir', 'LR');

  g.node({ shape: 'circle' });
  g.node('factory_fn', {
    shape: 'plain',
    label: renderHTMLLike(<FactoryFnLabel />),
  });

  g.node('oop', {
    shape: 'plain',
    label: renderHTMLLike(<OOPLabel />),
  });

  g.edge([['factory_fn', 'oop'], 'Model']);

  g.edge(['Model', 'DOT'], { label: 'toDot' });
  g.edge(['DOT', 'Model'], { label: 'fromDot' });
});

export const meta = {
  exportTo: ['./packages/ts-graphviz/media/ts-graphviz.svg'],
};
