import _ from 'ts-dedent';
import { parse } from '../parse';
import { Kinds } from '../types';

test.each([
  [
    _`
      digraph {
        style=filled;
        color=lightgrey;
        label = "example #1";
      }
    `,
  ],
  [
    _`
      digraph {
        style=filled; color=lightgrey; label = "example #1";
      }
    `,
  ],
  [
    _`
      digraph {
        style=
        filled;
        color
        =lightgrey;
        label = "example #1";
      }
    `,
  ],
  [
    _`
      digraph {
        style=filled
        color=lightgrey
        label = "example #1"
      }
    `,
  ],
])('#', (dot) => {
  const result = parse(dot);
  expect(result.children).toMatchObject([
    {
      kind: Kinds.Attribute,
      key: 'style',
      value: 'filled',
    },
    {
      kind: Kinds.Attribute,
      key: 'color',
      value: 'lightgrey',
    },
    {
      kind: Kinds.Attribute,
      key: 'label',
      value: 'example #1',
    },
  ]);
});
