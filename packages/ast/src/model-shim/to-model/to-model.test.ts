import { htmlLike } from '@ts-graphviz/common';
import { defaultModelKit } from '@ts-graphviz/core';
import { describe, expect, test } from 'vitest';
import { createElement } from '../../builder/create-element.js';
import { parse } from '../../dot-shim/parser/parse.js';
import { legacyToModel } from './legacy-to-model.js';
import { toModel } from './to-model.js';

test('empty Dot converts to a Dot model without graphs', () => {
  const ast = createElement('Dot', {}, []);

  const model = toModel(ast, { models: defaultModelKit });
  expect(model.$$type).toBe('Dot');
  expect(model.graphs).toHaveLength(0);
  expect(model.comment).toBeUndefined();
});

test('comment before a graph is attached to the graph', () => {
  const ast = createElement('Dot', {}, [
    createElement(
      'Comment',
      {
        kind: 'Macro',
        value: 'This is comment',
      },
      [],
    ),
    createElement(
      'Graph',
      {
        strict: false,
        directed: true,
      },
      [],
    ),
  ]);
  const model = toModel(ast, { models: defaultModelKit });
  expect(model.comment).toBeUndefined();
  expect(model.graphs).toHaveLength(1);
  expect(model.graphs[0].comment).toStrictEqual('This is comment');
});

test('multiple graphs and dangling comments', () => {
  const comment = (value: string) =>
    createElement('Comment', { kind: 'Slash', value }, []);
  const graph = (directed: boolean) =>
    createElement('Graph', { strict: false, directed }, []);
  const ast = createElement('Dot', {}, [
    comment('header'),
    comment('first'),
    graph(true),
    graph(false),
    comment('trailing'),
  ]);
  const model = toModel(ast, { models: defaultModelKit });
  expect(model.graphs.map((g) => g.directed)).toStrictEqual([true, false]);
  // Without locations, every comment leads the next graph, and those after
  // the last graph are the source's own.
  expect(model.graphs[0].comments.map((c) => [c.text, c.position])).toEqual([
    ['header', 'leading'],
    ['first', 'leading'],
  ]);
  expect(model.graphs[0].comment).toBe('header');
  expect(model.graphs[1].comments).toEqual([]);
  expect(model.comments.map((c) => [c.text, c.kind, c.position])).toEqual([
    ['trailing', 'Slash', 'end'],
  ]);
  expect(model.comment).toBe('trailing');
});

describe('HTML Lavel', () => {
  test('node label', () => {
    const ast = createElement(
      'Node',
      {
        id: createElement('Literal', { value: 'A', kind: 'bare' }),
      },
      [
        createElement('Attribute', {
          key: createElement('Literal', { value: 'label', kind: 'bare' }),
          value: createElement('Literal', { value: 'A', kind: 'html' }),
        }),
      ],
    );

    const model = toModel(ast, { models: defaultModelKit });
    expect(model.id).toStrictEqual('A');
    expect(model.attributes.get('label')).toStrictEqual(htmlLike('A'));
  });

  test('edge label', () => {
    const ast = createElement(
      'Edge',
      {
        targets: [
          createElement('NodeRef', {
            id: createElement('Literal', { value: 'A', kind: 'bare' }),
          }),
          createElement('NodeRef', {
            id: createElement('Literal', { value: 'B', kind: 'bare' }),
          }),
        ],
      },
      [
        createElement('Attribute', {
          key: createElement('Literal', { value: 'label', kind: 'bare' }),
          value: createElement('Literal', { value: 'A', kind: 'html' }),
        }),
      ],
    );

    const model = toModel(ast, { models: defaultModelKit });
    expect(model.attributes.get('label')).toStrictEqual(htmlLike('A'));
  });
});

describe('legacyToModel', () => {
  const source = parse(
    'digraph { a [color=red]; a [shape=box]; subgraph s { b } subgraph s { c } }',
    { as: 'Graph' },
  );

  test('adds a node or a subgraph declared again to the first one', () => {
    const G = legacyToModel(source, { models: defaultModelKit });
    expect(G.getNodes()).toHaveLength(1);
    expect(G.getNodes()[0]?.attributes.values).toEqual([
      ['color', 'red'],
      ['shape', 'box'],
    ]);
    expect(G.getSubgraphs()).toHaveLength(1);
    expect(
      G.getSubgraphs()[0]
        ?.getNodes()
        .map((n) => n.id),
    ).toEqual(['b', 'c']);
  });

  test('toModel keeps each declaration', () => {
    const G = toModel(source, { models: defaultModelKit });
    expect(G.getNodes()).toHaveLength(2);
    expect(G.getSubgraphs()).toHaveLength(2);
  });
});
