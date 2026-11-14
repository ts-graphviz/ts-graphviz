import {
  createLabelContext,
  createRoot,
  Digraph,
  Edge,
  type FromElementOptions,
  fromElement,
  htmlLikeFromElement,
  type LabelContext,
  Node,
  readLabelContext,
  Subgraph,
} from '@ts-graphviz/react';
import type {
  DotModel,
  GraphBaseModel,
  HTMLLikeValue,
  NodeModel,
  RootGraphModel,
} from 'ts-graphviz';
import { Digraph as DigraphModel, isNodeModel } from 'ts-graphviz';
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
  });
});

describe('rendering', () => {
  it('fromElement gives a Dot model, or the container', () => {
    expectTypeOf(fromElement(<Digraph />)).toEqualTypeOf<Promise<DotModel>>();
    const container: RootGraphModel = new DigraphModel();
    expectTypeOf(fromElement(<Node id="a" />, { container })).toEqualTypeOf<
      Promise<RootGraphModel>
    >();
    // Options that may or may not have a container
    const options: FromElementOptions = {};
    expectTypeOf(fromElement(<Digraph />, options)).toEqualTypeOf<
      Promise<GraphBaseModel | RootGraphModel | DotModel>
    >();
  });

  it('render() of a root gives nothing', () => {
    expectTypeOf(createRoot().render(<Digraph />)).toEqualTypeOf<void>();
  });

  it('htmlLikeFromElement gives a label value', () => {
    expectTypeOf(
      htmlLikeFromElement(<dot:b>x</dot:b>),
    ).toEqualTypeOf<HTMLLikeValue>();
  });

  it('a label context carries the type of its value', () => {
    const Accent = createLabelContext('black');
    expectTypeOf(Accent).toEqualTypeOf<LabelContext<string>>();
    expectTypeOf(readLabelContext(Accent)).toEqualTypeOf<string>();
    // Given and read: neither a wider nor a narrower context will do.
    expectTypeOf<LabelContext<string | number>>().not.toExtend<
      LabelContext<string>
    >();
    expectTypeOf<LabelContext<string>>().not.toExtend<
      LabelContext<string | number>
    >();
    htmlLikeFromElement(
      <Accent.Provider value="red">
        <dot:b>x</dot:b>
      </Accent.Provider>,
    );
    // @ts-expect-error the value of the context is a string
    <Accent.Provider value={1} />;
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
