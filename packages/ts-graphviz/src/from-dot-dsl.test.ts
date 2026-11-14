import { isNodeModel, isRootGraphModel, modelOf } from '@ts-graphviz/common';
import { Digraph, LegacyDigraph, Node } from '@ts-graphviz/core';
import { describe, expect, it } from 'vitest';
import { dsl } from './dsl.js';
import { fromDot, fromDotAll } from './from-dot.js';
import * as legacy from './legacy.js';
import { toDot } from './to-dot.js';

const source = 'digraph { a [label = "A"]; a -> b; }';

describe('fromDot with dsl: true', () => {
  it('gives the DSL of the graph it reads', () => {
    const G = fromDot(source, { dsl: true });
    expect(G).toBe(dsl(modelOf(G)));
    expect(isRootGraphModel(G)).toBe(false);
    const a = dsl(modelOf(G).getNodes('a')[0]);
    expect(a.label).toBe('A');
    a.label = 'B';
    expect(toDot(G)).toBe(toDot(fromDot(source.replace('"A"', '"B"'))));
  });

  it('gives the DSL of the model a rule reads', () => {
    const a = fromDot('a [label = "A"]', { parse: { as: 'Node' }, dsl: true });
    expect(a.$$type).toBe('Node');
    expect(a.label).toBe('A');
  });

  it('gives the DSL of a model of the classes given', () => {
    class MyNode extends Node {}
    const G = fromDot(source, {
      dsl: true,
      convert: { models: { Node: MyNode } },
    });
    expect(modelOf(G.node('a'))).toBeInstanceOf(MyNode);
    // The DSL creates with the kit of those classes.
    expect(modelOf(G.node('new'))).toBeInstanceOf(MyNode);
    G.subgraph('s', (s, kit) => {
      expect(kit.Node).toBe(MyNode);
      expect(modelOf(s.node('inner'))).toBeInstanceOf(MyNode);
    });
    const [H] = fromDotAll(source, {
      dsl: true,
      convert: { models: { Node: MyNode } },
    });
    expect(modelOf(H.node('new'))).toBeInstanceOf(MyNode);
  });

  it.each([
    ['left out', {}],
    ['false', { dsl: false }],
    ['not true', { dsl: 'yes' as unknown as boolean }],
    ['inherited', Object.create({ dsl: true })],
  ])('gives the model when dsl is %s', (_, options) => {
    expect(isRootGraphModel(fromDot(source, options))).toBe(true);
    expect(
      isNodeModel(fromDot('a', { ...options, parse: { as: 'Node' } })),
    ).toBe(true);
  });
});

describe('fromDotAll with dsl: true', () => {
  it('gives the DSLs of the graphs, in order', () => {
    const [G, H] = fromDotAll(`${source} graph H {}`, { dsl: true });
    expect(dsl(modelOf(G).getNodes('a')[0]).label).toBe('A');
    expect(modelOf(H).id).toBe('H');
    expect(fromDotAll('', { dsl: true })).toEqual([]);
  });

  it('gives the models otherwise', () => {
    const [G] = fromDotAll(source, { dsl: false });
    expect(G).toBeInstanceOf(Digraph);
  });
});

describe('ts-graphviz/legacy with dsl: true', () => {
  it('gives the DSL of the legacy model', () => {
    const G = legacy.fromDot(source, { dsl: true });
    expect(modelOf(G)).toBeInstanceOf(LegacyDigraph);
    const [H] = legacy.fromDotAll(source, { dsl: true });
    expect(modelOf(H)).toBeInstanceOf(LegacyDigraph);
  });
});
