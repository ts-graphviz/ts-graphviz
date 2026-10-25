// Type-checked by `pnpm check:consumer-types` against the packed packages
// (scripts/check-consumer-types.ts): components, `dot:*` elements and
// renderToDot, through the declarations of @ts-graphviz/react.
import {
  Digraph,
  Edge,
  Node,
  renderHTMLLike,
  renderToDot,
  Subgraph,
} from '@ts-graphviz/react';
import { digraph, type HTMLLikeValue } from 'ts-graphviz';

const label: HTMLLikeValue = renderHTMLLike(
  <dot:table border="1" cellpadding={4}>
    <dot:tr>
      <dot:td port="p">
        <dot:b>x</dot:b>
      </dot:td>
    </dot:tr>
  </dot:table>,
);

const dot: Promise<string> = renderToDot(
  <Digraph id="G" rankdir="LR">
    <Node id="a" label={<dot:b>x</dot:b>} />
    <Node id="b" shape="box" />
    <Edge targets={['a', 'b']} color="red" />
    <Subgraph id="cluster_0" label="c">
      <Node id="c" />
    </Subgraph>
  </Digraph>,
);
await dot;
digraph((g) => g.node('b', { label }));

// @ts-expect-error not an attribute of nodes
<Node id="a" rankdir="LR" />;
// @ts-expect-error a node needs an id
<Node shape="box" />;
// @ts-expect-error not a number
<dot:table border="wide" />;
// @ts-expect-error HTML-like labels have no port element
<dot:port>p</dot:port>;
