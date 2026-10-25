import {
  createRoot,
  Digraph,
  Edge,
  Node,
  renderHTMLLike,
  renderToDot,
  Subgraph,
} from '@ts-graphviz/react';
import type { HTMLLikeValue, NodeModel } from 'ts-graphviz';
import { isNodeModel } from 'ts-graphviz';
import { describe, expectTypeOf, it } from 'vitest';

// What users of `@ts-graphviz/react` get from its JSX types and inference
// (#1744). The declarations themselves are in api-reports/.

describe('components', () => {
  it('type their props by the attributes of their kind', () => {
    <Digraph id="G" rankdir="LR" strict>
      <Node id="a" shape="box" label="text" />
      <Node id="b" label={<dot:b>bold</dot:b>} />
      <Edge targets={['a', 'b']} color="red" />
      <Subgraph id="cluster_0" label="c">
        <Node id="c" />
      </Subgraph>
    </Digraph>;
    // @ts-expect-error not an attribute of nodes
    <Node id="a" rankdir="LR" />;
    // @ts-expect-error a node needs an id
    <Node shape="box" />;
  });

  it('type HTML-like label elements and their attributes', () => {
    <dot:table border="1" cellpadding={4}>
      {['a', 'b'].map((text) => (
        <dot:tr key={text}>
          <dot:td port={text}>{text}</dot:td>
        </dot:tr>
      ))}
    </dot:table>;
    // @ts-expect-error not a number
    <dot:table border="wide" />;
    // @ts-expect-error HTML-like labels have no port element
    <dot:port>p</dot:port>;
  });
});

describe('rendering', () => {
  it('renderToDot gives text; renderHTMLLike a label value', () => {
    expectTypeOf(renderToDot(<Digraph />)).toEqualTypeOf<Promise<string>>();
    expectTypeOf(
      renderHTMLLike(<dot:b>x</dot:b>),
    ).toEqualTypeOf<HTMLLikeValue>();
  });

  it('getTopLevelModels narrows with a guard', () => {
    const root = createRoot();
    expectTypeOf(root.getTopLevelModels(isNodeModel)).toEqualTypeOf<
      NodeModel[]
    >();
    expectTypeOf(root.getTopLevelModels<NodeModel>()).toEqualTypeOf<
      NodeModel[]
    >();
  });
});
