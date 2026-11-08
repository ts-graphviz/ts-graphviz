import { fromModel } from '@ts-graphviz/ast';
import {
  type ForwardRefNode,
  isNodeModel,
  modelOf,
  type ReadonlyAttributes,
  type ReadonlyGraphBaseModel,
  type ReadonlyNodeModel,
} from '@ts-graphviz/common';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@ts-graphviz/adapter', () => ({
  toBlob: vi.fn().mockResolvedValue(new Blob()),
}));

import { toBlob } from './adapter.js';
import { digraph } from './model-factory.js';
import { toDot } from './to-dot.js';

// The read-only types say only that these functions do not change a model;
// the models stay writable objects. Check that they really leave it as it is.

function attributes(a: ReadonlyAttributes) {
  return a.values.map(([key, value]) => [key, value]);
}

// A node model by its id; a forward reference copied with its port.
function target(t: ReadonlyNodeModel | ForwardRefNode) {
  return isNodeModel(t) ? t.id : { ...t };
}

function graph(g: ReadonlyGraphBaseModel): unknown {
  return {
    id: g.id,
    comment: g.comment,
    attributes: attributes(g),
    defaults: [g.attributes.graph, g.attributes.node, g.attributes.edge].map(
      (list) => [list.comment, attributes(list)],
    ),
    nodes: g.nodes.map((n) => [n.id, n.comment, attributes(n.attributes)]),
    edges: g.edges.map((e) => [
      e.comment,
      attributes(e.attributes),
      e.targets.map((t) =>
        Array.isArray(t)
          ? (t as readonly (ReadonlyNodeModel | ForwardRefNode)[]).map(target)
          : target(t as ReadonlyNodeModel | ForwardRefNode),
      ),
    ]),
    subgraphs: g.subgraphs.map(graph),
  };
}

function model() {
  const g = digraph('G', { label: 'root' }, (g) => {
    g.$comment = 'graph';
    g.node({ shape: 'box' });
    g.edge({ color: 'red' });
    const a = g.node('a', { label: 'A' });
    a.$comment = 'node';
    g.edge([a, 'b', a.$port({ port: 'p', compass: 'n' })], { label: 'e' });
    g.subgraph('cluster_s', { label: 'S' }, (s) => {
      s.node('c');
      s.edge(['c', a]);
    });
  });
  return modelOf(g);
}

describe('the readers leave the model as it is', { tags: ['SM-5'] }, () => {
  it('toDot', () => {
    const g = model();
    const before = graph(g);
    const dot = toDot(g);
    expect(graph(g)).toStrictEqual(before);
    expect(toDot(g)).toBe(dot);
  });

  it('fromModel', () => {
    const g = model();
    const before = graph(g);
    fromModel(g);
    for (const node of g.nodes) fromModel(node);
    for (const edge of g.edges) fromModel(edge);
    for (const subgraph of g.subgraphs) fromModel(subgraph);
    expect(graph(g)).toStrictEqual(before);
  });

  it('toBlob of ts-graphviz/adapter', async () => {
    const g = model();
    const before = graph(g);
    await toBlob(g);
    expect(graph(g)).toStrictEqual(before);
  });
});
