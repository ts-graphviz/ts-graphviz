import { describe, expect, it } from 'vitest';
import type { ASTNode } from '../../types.js';
import { parse } from '../parser/parse.js';
import { stringify } from './stringify.js';

// ASTs built in code, outside the types: shapes JSON cannot express.
type Raw = Record<string, unknown>;
const literal = (value: string): Raw => ({
  type: 'Literal',
  value,
  kind: 'bare',
});
const node = (id: string): Raw => ({
  type: 'Node',
  id: literal(id),
  children: [],
});
const graph = (...children: Raw[]): ASTNode =>
  ({
    type: 'Graph',
    directed: true,
    strict: false,
    children,
  }) as unknown as ASTNode;

/** A subgraph that holds the next one twice, k levels deep: 2^k paths to `a`. */
const doubling = (k: number): Raw => {
  let inner = node('a');
  for (let i = 0; i < k; i++) {
    inner = { type: 'Subgraph', children: [inner, inner] };
  }
  return inner;
};

const thrown = (f: () => unknown): unknown => {
  try {
    f();
  } catch (e) {
    return e;
  }
  throw new Error('expected a throw');
};

describe('printing an AST that contains itself', { tags: ['SM-2'] }, () => {
  it.each([
    [
      'a subgraph among its own statements',
      () => {
        const s: Raw = { type: 'Subgraph', children: [node('a')] };
        (s.children as Raw[]).push(s);
        return graph(s);
      },
    ],
    [
      'a subgraph as a target of its own edge',
      () => {
        const s: Raw = { type: 'Subgraph', children: [] };
        (s.children as Raw[]).push({
          type: 'Edge',
          targets: [s, { type: 'NodeRef', id: literal('b') }],
          children: [],
        });
        return graph(s);
      },
    ],
    [
      'an attribute whose value is itself',
      () => {
        const a: Raw = { type: 'Attribute', key: literal('label') };
        a.value = a;
        return graph(a);
      },
    ],
    [
      'a graph among its own statements',
      () => {
        const g = graph(node('a'));
        (g as unknown as { children: unknown[] }).children.push(g);
        return g;
      },
    ],
  ])('throws TSG_ERR_CYCLIC_STRUCTURE for %s', (_, build) => {
    // Printed without end before (until memory ran out).
    const error = thrown(() => stringify(build()));
    expect(error).toBeInstanceOf(TypeError);
    expect(error).toMatchObject({ code: 'TSG_ERR_CYCLIC_STRUCTURE' });
  });
});

describe('printing an AST whose nodes come from Object.prototype', {
  tags: ['SM-2', 'SM-8'],
}, () => {
  it('checks the fields the printer reads, inherited ones included', () => {
    // A graph without children of its own reads `children` through the
    // prototype chain; the check read only own fields, passed, and the
    // printer printed the graph inside itself without end.
    const g = {
      type: 'Graph',
      directed: true,
      strict: false,
    } as unknown as ASTNode;
    Object.defineProperty(Object.prototype, 'children', {
      value: [g],
      configurable: true,
      writable: true,
    });
    let error: unknown;
    try {
      stringify(g);
    } catch (e) {
      error = e;
    } finally {
      delete (Object.prototype as { children?: unknown }).children;
    }
    expect(error).toMatchObject({ code: 'TSG_ERR_CYCLIC_STRUCTURE' });
  });
});

describe('printing an AST that shares nodes', { tags: ['SM-2'] }, () => {
  it('stops a node shared at every level from printing 2^k times', () => {
    // k = 20 printed 140 MB in 4 s before; k = 40 would never finish.
    const start = performance.now();
    const error = thrown(() => stringify(graph(doubling(40))));
    expect(performance.now() - start).toBeLessThan(1000);
    expect(error).toBeInstanceOf(RangeError);
    expect(error).toMatchObject({
      code: 'TSG_ERR_SHARED_NODE_COUNT_EXCEEDED',
    });
  });

  it('prints a shared node in each place within maxSharedNodes', () => {
    // 2^3 = 8 copies of `a`. Reached again: 1 of the 2 paths to the
    // second level, 3 of 4 to the third, 7 of 8 to the node and to its id.
    const ast = graph(doubling(3));
    expect(stringify(ast).match(/a;/g)).toHaveLength(8);
    expect(stringify(ast, { maxSharedNodes: 1 + 3 + 7 + 7 })).toBe(
      stringify(ast),
    );
    expect(() => stringify(ast, { maxSharedNodes: 1 + 3 + 7 + 6 })).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_SHARED_NODE_COUNT_EXCEEDED' }),
    );
  });

  it('counts a shared leaf each time it is reached again', () => {
    const id = literal('a');
    const ast = graph(
      ...Array.from({ length: 10 }, () => ({
        type: 'Node',
        id,
        children: [],
      })),
    );
    expect(() => stringify(ast, { maxSharedNodes: 9 })).not.toThrow();
    expect(() => stringify(ast, { maxSharedNodes: 8 })).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_SHARED_NODE_COUNT_EXCEEDED' }),
    );
  });

  it('does not limit sharing with maxSharedNodes: 0', () => {
    expect(
      stringify(graph(doubling(10)), { maxSharedNodes: 0 }).match(/a;/g),
    ).toHaveLength(1024);
  });

  it('does not count an AST without shared nodes, whatever its size', () => {
    const ast = parse(
      `digraph { ${Array.from({ length: 2000 }, (_, i) => `n${i} -> m${i} [label=x];`).join(' ')} }`,
    );
    expect(() => stringify(ast, { maxSharedNodes: 1 })).not.toThrow();
  });
});

describe('the error for a node no plugin prints', { tags: ['SM-2'] }, () => {
  it('names only the type, so a large or cyclic node keeps its code', () => {
    // JSON.stringify of the whole node threw an uncoded TypeError for a
    // cyclic one, and copied a large one into the message.
    const unknown: Raw = { type: 'Unknown', data: 'x'.repeat(1_000_000) };
    unknown.self = unknown;
    const error = thrown(() => stringify(graph(unknown)));
    expect(error).toMatchObject({ code: 'TSG_ERR_NO_PLUGIN' });
    expect((error as Error).message.length).toBeLessThan(200);
  });
});

describe('the error for an attribute list kind', { tags: ['SM-2'] }, () => {
  it('quotes at most a short part of the kind', () => {
    const error = thrown(() =>
      stringify(
        graph({
          type: 'AttributeList',
          kind: 'x'.repeat(1_000_000),
          children: [],
        }),
      ),
    );
    expect(error).toMatchObject({
      code: 'TSG_ERR_INVALID_ATTRIBUTE_LIST_KIND',
    });
    expect((error as Error).message.length).toBeLessThan(200);
  });
});
