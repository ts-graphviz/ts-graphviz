import { Digraph, defaultModelsContext, Node } from '@ts-graphviz/core';
import { describe, expect, it } from 'vitest';
import { createElement } from './builder/index.js';
import { parse, stringify } from './dot-shim/index.js';
import { toModel as convert, fromModel } from './model-shim/index.js';
import { sanitize } from './sanitize/index.js';
import type { DotASTNode } from './types.js';

/** Runs `fn` with `Object.prototype[key]` set to `value`. */
function withInherited<T>(key: string, value: unknown, fn: () => T): T {
  const proto = Object.prototype as Record<string, unknown>;
  proto[key] = value;
  try {
    return fn();
  } finally {
    delete proto[key];
  }
}

const toModel = (ast: unknown) =>
  convert(ast as DotASTNode, { models: defaultModelsContext() });

const literal = (value: string) =>
  createElement('Literal', { value, kind: 'quoted' }, []);

describe('[SM-8] node reference fields', () => {
  it('stringify writes only the port and compass point a node reference owns', () => {
    const ast = parse('digraph { a -> b }');
    for (const field of ['port', 'compass']) {
      const dot = withInherited(field, literal('extra'), () => stringify(ast));
      expect(dot).not.toContain('extra');
    }
  });

  it('toModel reads only the port and compass point a node reference owns', () => {
    const ast = parse('digraph { a -> b }');
    const model = withInherited('port', literal('extra'), () =>
      withInherited('compass', literal('n'), () => toModel(ast)),
    );
    const [edge] = model.graphs[0].edges;
    expect(edge.targets).toStrictEqual([
      { id: 'a', port: undefined, compass: undefined },
      { id: 'b', port: undefined, compass: undefined },
    ]);
  });

  it('fromModel writes only the port and compass point an edge target owns', () => {
    const graph = new Digraph();
    graph.createEdge([{ id: 'a' }, [{ id: 'b' }, { id: 'c' }]]);
    const dot = withInherited('port', 'extra', () =>
      withInherited('compass', 'n', () => stringify(fromModel(graph))),
    );
    expect(dot).not.toContain('extra');
    expect(dot).not.toContain(':n');
    expect(dot).toContain('{');
  });

  it('fromModel ignores an inherited compass point, valid or not', () => {
    const graph = new Digraph();
    graph.createEdge([{ id: 'a' }, { id: 'b' }]);
    const dot = withInherited('compass', 'extra', () =>
      stringify(fromModel(graph)),
    );
    expect(dot).not.toContain('extra');
  });

  it('sanitize checks only the port a node reference owns', () => {
    const dot = 'digraph { a -> b }';
    expect(
      withInherited('port', literal('line\nbreak'), () => sanitize(dot)),
    ).toBe(sanitize(dot));
  });

  it('keeps the ports a node reference owns', () => {
    const graph = new Digraph();
    const a = new Node('a');
    graph.addNode(a);
    graph.createEdge([a.port({ port: 'p', compass: 'n' }), { id: 'b' }]);
    const dot = stringify(fromModel(graph));
    expect(dot).toContain('"a":"p":"n"');
    expect(toModel(parse(dot)).graphs[0].edges[0].targets[0]).toStrictEqual({
      id: 'a',
      port: 'p',
      compass: 'n',
    });
  });
});
