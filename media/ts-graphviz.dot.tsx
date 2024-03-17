import { renderHTMLLike } from '@ts-graphviz/react';
import { digraph } from '../packages/ts-graphviz/src/model-factory.js';

function FactoryFnLabel() {
  return (
    <dot:table>
      <dot:tr>
        <dot:td bgcolor="#f0f0f0" align="CENTER">
          Model Factory Functions
        </dot:td>
      </dot:tr>
      <dot:tr>
        <dot:td port="description" align="LEFT">
          strict.digraph(...)
          <dot:br align="LEFT" />
          strict.graph(...)
          <dot:br align="LEFT" />
          digraph(...)
          <dot:br align="LEFT" />
          graph(...)
          <dot:br align="LEFT" />
        </dot:td>
      </dot:tr>
    </dot:table>
  );
}

function OOPLabel() {
  return (
    <dot:table>
      <dot:tr>
        <dot:td bgcolor="#f0f0f0" align="CENTER">
          Object-Oriented Programming
        </dot:td>
      </dot:tr>
      <dot:tr>
        <dot:td port="description" align="LEFT">
          new Digraph(...)
          <dot:br align="LEFT" />
          new Graph(...)
          <dot:br align="LEFT" />
          ...
          <dot:br align="LEFT" />
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
