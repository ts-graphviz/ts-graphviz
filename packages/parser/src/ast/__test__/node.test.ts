import _ from 'ts-dedent';
import { parse } from '../parse';
import { Kinds } from '../types';

test('simple node', () => {
  const result = parse(_`
    digraph {
      test;
    }
  `);
  expect(result.children[0]).toMatchObject({
    kind: Kinds.Node,
    id: 'test',
    attributes: [],
  });
});

test('node with attributes', () => {
  const result = parse(_`
    digraph {
      test [
        style=filled;
        color=lightgrey;
        label = "example #1";
      ];
    }
  `);
  expect(result.children[0]).toMatchObject({
    kind: Kinds.Node,
    id: 'test',
    attributes: [
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
  });
});
