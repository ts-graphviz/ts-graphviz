import _ from 'ts-dedent';
import { parse } from '../parse';
import { Kinds, Attrs } from '../types';

test('node', () => {
  const dot = _`
    digraph {
      node [
        style=filled;
        color=lightgrey;
        label = "example #1";
      ]
    }
  `;
  const result = parse(dot);
  expect(result.children).toMatchObject([
    {
      kind: Kinds.Attrs,
      target: Attrs.Target.Node,
      attrs: [
        {
          key: 'style',
          value: 'filled',
        },
        {
          key: 'color',
          value: 'lightgrey',
        },
        {
          key: 'label',
          value: 'example #1',
        },
      ],
    },
  ]);
});

test('edge', () => {
  const dot = _`
    digraph {
      edge [
        color=red;
        label = "example example";
      ];
    }
  `;
  const result = parse(dot);
  expect(result.children).toMatchObject([
    {
      kind: Kinds.Attrs,
      target: Attrs.Target.Edge,
      attrs: [
        {
          key: 'color',
          value: 'red',
        },
        {
          key: 'label',
          value: 'example example',
        },
      ],
    },
  ]);
});

test('graph', () => {
  const dot = _`
    digraph {
      graph [ fillcolor=red, label = "example example"]
    }
  `;
  const result = parse(dot);
  expect(result.children).toMatchObject([
    {
      kind: Kinds.Attrs,
      target: Attrs.Target.Graph,
      attrs: [
        {
          key: 'fillcolor',
          value: 'red',
        },
        {
          key: 'label',
          value: 'example example',
        },
      ],
    },
  ]);
});
