import { DOT, renderHTMLLike } from '@ts-graphviz/react';
import { digraph } from '../packages/ts-graphviz/src/model-factory.js';

function FactoryFnLabel() {
  return (
    <DOT.TABLE>
      <DOT.TR>
        <DOT.TD BGCOLOR="#f0f0f0" ALIGN="CENTER">
          Model Factory Functions
        </DOT.TD>
      </DOT.TR>
      <DOT.TR>
        <DOT.TD PORT="description" ALIGN="LEFT">
          strict.digraph(...)
          <DOT.BR ALIGN="LEFT" />
          strict.graph(...)
          <DOT.BR ALIGN="LEFT" />
          digraph(...)
          <DOT.BR ALIGN="LEFT" />
          graph(...)
          <DOT.BR ALIGN="LEFT" />
        </DOT.TD>
      </DOT.TR>
    </DOT.TABLE>
  );
}

function OOPLabel() {
  return (
    <DOT.TABLE>
      <DOT.TR>
        <DOT.TD BGCOLOR="#f0f0f0" ALIGN="CENTER">
          Object-Oriented Programming
        </DOT.TD>
      </DOT.TR>
      <DOT.TR>
        <DOT.TD PORT="description" ALIGN="LEFT">
          new Digraph(...)
          <DOT.BR ALIGN="LEFT" />
          new Graph(...)
          <DOT.BR ALIGN="LEFT" />
          ...
          <DOT.BR ALIGN="LEFT" />
        </DOT.TD>
      </DOT.TR>
    </DOT.TABLE>
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
