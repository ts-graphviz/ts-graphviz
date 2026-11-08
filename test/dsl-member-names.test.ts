import {
  ATTRIBUTE_KEYS,
  AttributeList,
  Digraph,
  Dot,
  dsl,
  Edge,
  Graph,
  LegacyDigraph,
  LegacyGraph,
  LegacySubgraph,
  modelOf,
  Node,
  Subgraph,
  toDot,
} from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

// The DOT DSL gives a model's members under their own names and the
// attributes as properties, so no member may be named like an attribute
// (#1932). The members deprecated in v4 are left out of the DSL; `id`,
// `comment` and `size` among them are attribute names.
const DEPRECATED = new Set([
  'id',
  'comment',
  'size',
  'values',
  'get',
  'set',
  'delete',
  'clear',
  'apply',
  'attributes',
]);
const STATEMENTS = ['node', 'edge', 'subgraph', 'graph'];

/** The names of an object's members: its own and its classes'. */
function memberNames(model: object): string[] {
  const names = new Set<string>();
  for (
    let o: object | null = model;
    o !== null && o !== Object.prototype;
    o = Object.getPrototypeOf(o)
  ) {
    for (const name of Object.getOwnPropertyNames(o)) names.add(name);
  }
  names.delete('constructor');
  return [...names].filter((name) => !DEPRECATED.has(name));
}

describe('no member of a model is named like an attribute', () => {
  const a = new Node('a');
  const models: [string, object][] = [
    ['Node', a],
    ['Edge', new Edge([a, new Node('b')])],
    ['Digraph', new Digraph()],
    ['Graph', new Graph()],
    ['Subgraph', new Subgraph()],
    ['AttributeList', new AttributeList('Node')],
    ['Dot', new Dot()],
    ['LegacyDigraph', new LegacyDigraph()],
    ['LegacyGraph', new LegacyGraph()],
    ['LegacySubgraph', new LegacySubgraph()],
  ];
  const attributes = new Set<string>(ATTRIBUTE_KEYS);

  it.each(models)('%s', (_, model) => {
    const names = memberNames(model);
    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((name) => attributes.has(name))).toStrictEqual([]);
  });

  it('nor a DOT statement', () => {
    expect(STATEMENTS.filter((name) => attributes.has(name))).toStrictEqual([]);
  });
});

describe('the DSL reads a name as a member or an attribute', () => {
  it('members under their own names; id, comment and size are attributes', () => {
    const g = dsl(new Digraph('G'));
    const a = g.node('a');
    expect(a.nodeId).toBe('a');
    expect(g.graphId).toBe('G');
    expect(g.subgraph('s').subgraphId).toBe('s');
    a.id = 'svg-a';
    a.comment = 'note';
    g.size = '7,7';
    expect(modelOf(a).getAttribute('id')).toBe('svg-a');
    expect(modelOf(a).getAttribute('comment')).toBe('note');
    expect(modelOf(g).getAttribute('size')).toBe('7,7');
    expect(Object.keys(a)).toStrictEqual(['id', 'comment']);
    a.setAttribute('label', 'A');
    expect(a.getAttribute('label')).toBe('A');
    expect(toDot(g)).toContain('size = "7,7";');
  });

  it('a member named like an attribute is reached with a $', () => {
    class Weighted extends Edge {
      weight(): number {
        return 2;
      }
      tag = 'mine';
    }
    const e = dsl(new Weighted([new Node('a'), new Node('b')]));
    const view = e as unknown as {
      weight: unknown;
      $weight(): number;
      tag: string;
      $tag: string;
    };
    expect(view.weight).toBeUndefined();
    expect(view.$weight()).toBe(2);
    expect(view.tag).toBe('mine');
    expect(view.$tag).toBe('mine');
    view.weight = 3;
    expect(modelOf(e).getAttribute('weight')).toBe(3);
  });

  it('the deprecated members are reached with a $', () => {
    const a = dsl(new Digraph()).node('a');
    const legacy = a as unknown as { $id: string; $comment?: string };
    expect(legacy.$id).toBe('a');
    legacy.$comment = 'leading';
    expect(a.comments.map((c) => c.text)).toStrictEqual(['leading']);
  });

  it('writes and deletes members by their names', () => {
    const g = dsl(new Digraph());
    g.strict = true;
    expect(modelOf(g).strict).toBe(true);
    expect('strict' in g).toBe(true);
    expect(Object.keys(g)).toStrictEqual([]);
  });
});

describe('the proxy traps agree on what a name is', () => {
  it('a graph member named like a statement: the statement, in every trap', () => {
    class Custom extends Digraph {
      node(): string {
        return 'mine';
      }
    }
    const g = dsl(new Custom()) as unknown as Record<string, unknown>;
    expect(typeof g.node).toBe('function');
    expect(() => {
      g.node = 1;
    }).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_UNWRITABLE_PROPERTY' }),
    );
    expect(Reflect.deleteProperty(g, 'node')).toBe(true);
    expect((g.$node as () => string)()).toBe('mine');
  });

  it('an attribute under a member or statement name is not an own property', () => {
    const g = dsl(new Digraph());
    const model = modelOf(g) as unknown as {
      setAttribute(name: string, value: string): void;
    };
    model.setAttribute('nodes', 'x');
    model.setAttribute('node', 'y');
    model.setAttribute('$tag', 'z');
    g.label = 'G';
    expect(Reflect.ownKeys(g)).toStrictEqual(['label']);
    expect(Object.keys(g)).toStrictEqual(['label']);
    expect(Array.isArray(g.nodes)).toBe(true);
    expect(modelOf(g).getAttribute('nodes' as 'label')).toBe('x');
  });

  it('a literal $ member and the $ alias of a member', () => {
    class Tagged extends Node {
      $foo = 'literal';
      foo = 'plain';
    }
    const n = dsl(new Tagged('a')) as unknown as Record<string, string>;
    expect(n.$foo).toBe('literal');
    expect(n.foo).toBe('plain');
    expect(n.$$foo).toBe('literal');
  });

  it('something added to Object.prototype is not a $ member either', () => {
    class Tagged extends Node {
      tag = 'mine';
    }
    const proto = Object.prototype as Record<string, unknown>;
    proto.$tag = 'polluted';
    try {
      const n = dsl(new Tagged('a')) as unknown as Record<string, string>;
      expect(n.$tag).toBe('mine');
      expect(n.$toString).toBeUndefined();
      expect('$toString' in n).toBe(false);
      expect('$constructor' in n).toBe(false);
    } finally {
      delete proto.$tag;
    }
  });

  it('a member setter gets the model of a DSL', () => {
    class Holder extends Digraph {
      held: unknown;
      set hold(value: unknown) {
        this.held = value;
      }
    }
    const g = dsl(new Holder());
    const a = g.node('a');
    (g as unknown as { hold: unknown }).hold = a;
    expect((modelOf(g) as Holder).held).toBe(modelOf(a));
  });
});
