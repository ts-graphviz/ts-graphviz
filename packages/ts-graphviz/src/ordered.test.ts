import { modelOf } from '@ts-graphviz/common';
import {
  Digraph,
  Node,
  OrderedDigraph,
  OrderedGraph,
  OrderedSubgraph,
} from '@ts-graphviz/core';
import { describe, expect, test } from 'vitest';
import * as ordered from './ordered.js';
import * as main from './ts-graphviz.js';

const source = 'digraph { node [color=red]; a; node [color=blue]; b; }';

const expected = `digraph {
  node [
    color = "red";
  ];
  "a";
  node [
    color = "blue";
  ];
  "b";
}`;

describe('the factories', () => {
  test('keep default attribute statements in their place', () => {
    const G = ordered.digraph((g) => {
      g.node({ color: 'red' });
      g.node('a');
      g.node({ color: 'blue' });
      g.node('b');
    });
    expect(modelOf(G)).toBeInstanceOf(OrderedDigraph);
    expect(ordered.toDot(G)).toBe(ordered.toDot(ordered.fromDot(source)));
  });

  test('graph, strict and subgraphs use the ordered classes', () => {
    expect(modelOf(ordered.graph())).toBeInstanceOf(OrderedGraph);
    const S = ordered.strict.digraph();
    expect(modelOf(S)).toBeInstanceOf(OrderedDigraph);
    expect(S.$strict).toBe(true);
    expect(modelOf(ordered.strict.graph())).toBeInstanceOf(OrderedGraph);
    expect(modelOf(S.subgraph('s'))).toBeInstanceOf(OrderedSubgraph);
  });

  test('withContext keeps the ordered classes it is not given', () => {
    class MyNode extends Node {}
    const { digraph } = ordered.withContext({ Node: MyNode });
    const G = digraph((g) => {
      g.node('a');
    });
    expect(modelOf(G)).toBeInstanceOf(OrderedDigraph);
    expect(modelOf(G.$getNode('a') as object)).toBeInstanceOf(MyNode);
    // A class it is given takes the place of the ordered one; undefined
    // does not.
    expect(
      modelOf(ordered.withContext({ Digraph }).digraph()),
    ).not.toBeInstanceOf(OrderedDigraph);
    expect(
      modelOf(ordered.withContext({ Digraph: undefined }).digraph()),
    ).toBeInstanceOf(OrderedDigraph);
  });
});

describe('fromDot and fromDotAll', () => {
  test('read into the ordered classes', () => {
    const G = ordered.fromDot(source);
    expect(G).toBeInstanceOf(OrderedDigraph);
    expect(ordered.toDot(G)).toBe(expected);
    const [first, second] = ordered.fromDotAll(`${source} graph {}`);
    expect(first).toBeInstanceOf(OrderedDigraph);
    expect(second).toBeInstanceOf(OrderedGraph);
  });

  test('take the other options and classes as they are given', () => {
    class MyNode extends Node {}
    const node = ordered.fromDot('a [label=x]', {
      parse: { startRule: 'Node' },
      convert: { models: { Node: MyNode } },
    });
    expect(node).toBeInstanceOf(MyNode);
    const G = ordered.fromDot(source, { convert: { models: { Digraph } } });
    expect(G).not.toBeInstanceOf(OrderedDigraph);
  });

  test('keep the ordered class for a kind given undefined', () => {
    const G = ordered.fromDot(source, {
      convert: { models: { Digraph: undefined } },
    });
    expect(G).toBeInstanceOf(OrderedDigraph);
  });

  test('pass the parse options on', () => {
    expect(() =>
      ordered.fromDot(source, { parse: { maxInputSize: 8 } }),
    ).toThrow(expect.objectContaining({ limit: 'maxInputSize' }));
    expect(() =>
      ordered.fromDotAll(source, { parse: { maxInputSize: 8 } }),
    ).toThrow(expect.objectContaining({ limit: 'maxInputSize' }));
  });

  test('ignore inherited options and classes', () => {
    const options = Object.create({ convert: { models: { Digraph } } });
    expect(ordered.fromDot(source, options)).toBeInstanceOf(OrderedDigraph);
    const convert = Object.create({ models: { Digraph } });
    expect(ordered.fromDot(source, { convert })).toBeInstanceOf(OrderedDigraph);
    const models = Object.create({ Digraph });
    expect(
      ordered.fromDotAll(source, { convert: { models } })[0],
    ).toBeInstanceOf(OrderedDigraph);
    expect(modelOf(ordered.withContext(models).digraph())).toBeInstanceOf(
      OrderedDigraph,
    );
  });
});

test('everything else is that of ts-graphviz', () => {
  const own = new Set([
    'digraph',
    'graph',
    'strict',
    'withContext',
    'fromDot',
    'fromDotAll',
  ]);
  const exports = new Map<string, unknown>(Object.entries(ordered));
  expect([...exports.keys()].sort()).toEqual(Object.keys(main).sort());
  for (const [name, value] of Object.entries(main)) {
    if (own.has(name)) expect(exports.get(name), name).not.toBe(value);
    else expect(exports.get(name), name).toBe(value);
  }
  // ts-graphviz itself keeps one set of defaults per graph.
  expect(main.toDot(main.fromDot(source))).not.toBe(expected);
});
