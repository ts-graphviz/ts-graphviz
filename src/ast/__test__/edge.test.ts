import _ from 'ts-dedent';
import { parse } from '../parse';
import { Kinds } from '../types';

test('simple edge', () => {
  const result = parse(`
    digraph {
      a -> b;
    }
  `);
  expect(result.children[0]).toMatchObject({
    kind: Kinds.Edge,
    targets: [{ id: 'a' }, { id: 'b' }],
    attributes: [],
  });
});

test('edge with port', () => {
  const result = parse(_`
    digraph {
      a:p1 -> b:p2 -> c:p3:w -> d:w;
    }
  `);
  expect(result.children[0]).toMatchObject({
    kind: Kinds.Edge,
    targets: [
      { id: 'a', port: 'p1' },
      { id: 'b', port: 'p2' },
      { id: 'c', port: 'p3', compass: 'w' },
      { id: 'd', compass: 'w' },
    ],
    attributes: [],
  });
});

test('edge with attributes', () => {
  const result = parse(`
    digraph {
      a -> b [
        color=lightgrey;
        label = "example #1";
      ];
    }
  `);
  expect(result.children[0]).toMatchObject({
    kind: Kinds.Edge,
    targets: [{ id: 'a' }, { id: 'b' }],
    attributes: [
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

test('grouped edge targets', () => {
  const result = parse(`
    digraph {
      {a1, a2} -> {b1, b2};
    }
  `);
  expect(result.children[0]).toMatchObject({
    kind: Kinds.Edge,
    targets: [
      [{ id: 'a1' }, { id: 'a2' }],
      [{ id: 'b1' }, { id: 'b2' }],
    ],
    attributes: [],
  });
});

test('grouped ported edge targets', () => {
  const result = parse(_`
    digraph {
      {a1:p1, a2:p2:w} -> {b1:e, b2:p3};
    }
  `);
  expect(result.children[0]).toMatchObject({
    kind: Kinds.Edge,
    targets: [
      [
        { id: 'a1', port: 'p1' },
        { id: 'a2', port: 'p2', compass: 'w' },
      ],
      [
        { id: 'b1', compass: 'e' },
        { id: 'b2', port: 'p3' },
      ],
    ],
    attributes: [],
  });
});
