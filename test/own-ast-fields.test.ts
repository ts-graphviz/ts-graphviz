import { parse, sanitize, stringify } from '@ts-graphviz/ast';
import { isNodeModel } from '@ts-graphviz/common';
import { Digraph } from '@ts-graphviz/core';
import { fromDot, toDot } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

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

const comment = { type: 'Comment', kind: 'Block', value: 'extra' };
const literal = { type: 'Literal', value: 'extra', kind: 'quoted' };

describe('[SM-8] optional AST fields are read only when owned', () => {
  it('comments stay with the node they were read at', () => {
    const shared: unknown[] = [];
    const dot = withInherited('trailingComments', shared, () =>
      stringify(parse('digraph { a /* c */ -> b; x -> y }')),
    );
    expect(shared).toStrictEqual([]);
    expect(dot.match(/\/\* c \*\//g)).toHaveLength(1);
  });

  it('stringify writes only the comments and ids a node owns', () => {
    const ast = parse('digraph { {a b} -> c; subgraph { d } }');
    for (const [key, value] of [
      ['leadingComments', [comment]],
      ['trailingComments', [comment]],
      ['danglingComments', [comment]],
      ['id', literal],
    ] as const) {
      expect(
        withInherited(key, value, () => stringify(ast)),
        key,
      ).not.toContain('extra');
    }
  });

  it('fromDot gives an anonymous subgraph no id', () => {
    const g = withInherited('id', literal, () =>
      fromDot('digraph { subgraph { a } }'),
    );
    expect(g.subgraphs.map((s) => s.id)).toStrictEqual([undefined]);
  });

  it('sanitize walks only nodes', () => {
    const dot = 'digraph { a [label="x"] }';
    expect(withInherited('type', 'Attribute', () => sanitize(dot))).toBe(
      sanitize(dot),
    );
  });

  it('a plain object is not a model because of an inherited $$type', () => {
    expect(
      withInherited('$$type', 'Node', () => isNodeModel({ id: 'a' })),
    ).toBe(false);
    const g = new Digraph();
    g.createEdge([{ id: 'a', port: 'p' }, 'b']);
    expect(withInherited('$$type', 'Node', () => toDot(g))).toContain(
      '"a":"p"',
    );
  });
});

describe('fields from a class still count', () => {
  it('stringify writes an id defined by a class', () => {
    class NamedSubgraph {
      readonly type = 'Subgraph';
      readonly children = [];
      get id() {
        return { type: 'Literal', value: 's', kind: 'bare' };
      }
    }
    const graph = {
      type: 'Graph',
      directed: true,
      strict: false,
      children: [new NamedSubgraph()],
    };
    expect(stringify({ type: 'Dot', children: [graph] } as never)).toContain(
      'subgraph s {}',
    );
  });

  it('a model class passes the guards through its own getter', () => {
    const g = new Digraph();
    expect(isNodeModel(g.createNode('a'))).toBe(true);
    expect(isNodeModel(new Proxy(g.createNode('b'), {}))).toBe(true);
  });
});
