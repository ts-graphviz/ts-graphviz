import { modelOf } from '@ts-graphviz/common';
import {
  Digraph,
  LegacyDigraph,
  LegacyGraph,
  LegacySubgraph,
  Node,
} from '@ts-graphviz/core';
import { describe, expect, test } from 'vitest';
import * as legacy from './legacy.js';
import * as main from './ts-graphviz.js';

const source = 'digraph { node [color=red]; a; node [color=blue]; b; }';

// One set of defaults, written first: the last value wins, as in 3.x.
const expected = `digraph {
  node [
    color = "blue";
  ];
  "a";
  "b";
}`;

describe('the factories', () => {
  test('merge default attribute statements into one set', () => {
    const G = legacy.digraph((g) => {
      g.node({ color: 'red' });
      g.node('a');
      g.node({ color: 'blue' });
      g.node('b');
    });
    expect(modelOf(G)).toBeInstanceOf(LegacyDigraph);
    expect(legacy.toDot(G)).toBe(legacy.toDot(legacy.fromDot(source)));
  });

  test('graph, strict and subgraphs use the legacy classes', () => {
    expect(modelOf(legacy.graph())).toBeInstanceOf(LegacyGraph);
    const S = legacy.strict.digraph();
    expect(modelOf(S)).toBeInstanceOf(LegacyDigraph);
    expect(S.strict).toBe(true);
    expect(modelOf(legacy.strict.graph())).toBeInstanceOf(LegacyGraph);
    expect(modelOf(S.subgraph('s'))).toBeInstanceOf(LegacySubgraph);
  });

  test('withContext keeps the legacy classes it is not given', () => {
    class MyNode extends Node {}
    const { digraph } = legacy.withContext({ Node: MyNode });
    const G = digraph((g) => {
      g.node('a');
    });
    expect(modelOf(G)).toBeInstanceOf(LegacyDigraph);
    expect(modelOf(G.getNode('a') as object)).toBeInstanceOf(MyNode);
    // A class it is given takes the place of the legacy one; undefined
    // does not.
    expect(
      modelOf(legacy.withContext({ Digraph }).digraph()),
    ).not.toBeInstanceOf(LegacyDigraph);
    expect(
      modelOf(legacy.withContext({ Digraph: undefined }).digraph()),
    ).toBeInstanceOf(LegacyDigraph);
  });
});

describe('fromDot and fromDotAll', () => {
  test('read into the legacy classes', () => {
    const G = legacy.fromDot(source);
    expect(G).toBeInstanceOf(LegacyDigraph);
    expect(legacy.toDot(G)).toBe(expected);
    const [first, second] = legacy.fromDotAll(`${source} graph {}`);
    expect(first).toBeInstanceOf(LegacyDigraph);
    expect(second).toBeInstanceOf(LegacyGraph);
  });

  test('take the other options and classes as they are given', () => {
    class MyNode extends Node {}
    const node = legacy.fromDot('a [label=x]', {
      parse: { as: 'Node' },
      convert: { models: { Node: MyNode } },
    });
    expect(node).toBeInstanceOf(MyNode);
    const G = legacy.fromDot(source, { convert: { models: { Digraph } } });
    expect(G).not.toBeInstanceOf(LegacyDigraph);
  });

  test('keep the legacy class for a kind given undefined', () => {
    const G = legacy.fromDot(source, {
      convert: { models: { Digraph: undefined } },
    });
    expect(G).toBeInstanceOf(LegacyDigraph);
  });

  test('pass the parse options on', () => {
    expect(() =>
      legacy.fromDot(source, { parse: { maxInputSize: 8 } }),
    ).toThrow(expect.objectContaining({ limit: 'maxInputSize' }));
    expect(() =>
      legacy.fromDotAll(source, { parse: { maxInputSize: 8 } }),
    ).toThrow(expect.objectContaining({ limit: 'maxInputSize' }));
  });

  test('ignore inherited options and classes', () => {
    const options = Object.create({ convert: { models: { Digraph } } });
    expect(legacy.fromDot(source, options)).toBeInstanceOf(LegacyDigraph);
    const convert = Object.create({ models: { Digraph } });
    expect(legacy.fromDot(source, { convert })).toBeInstanceOf(LegacyDigraph);
    const models = Object.create({ Digraph });
    expect(
      legacy.fromDotAll(source, { convert: { models } })[0],
    ).toBeInstanceOf(LegacyDigraph);
    expect(modelOf(legacy.withContext(models).digraph())).toBeInstanceOf(
      LegacyDigraph,
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
  const exports = new Map<string, unknown>(Object.entries(legacy));
  expect([...exports.keys()].sort()).toEqual(Object.keys(main).sort());
  for (const [name, value] of Object.entries(main)) {
    if (own.has(name)) expect(exports.get(name), name).not.toBe(value);
    else expect(exports.get(name), name).toBe(value);
  }
  // ts-graphviz itself keeps each default attribute statement in its place.
  expect(main.toDot(main.fromDot(source))).not.toBe(expected);
  expect(main.toDot(main.fromDot(source))).toContain('color = "red"');
});
