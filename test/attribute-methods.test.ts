import {
  type AttributeKey,
  AttributeList,
  type Attributes,
  Digraph,
  digraph,
  dsl,
  Edge,
  fromDot,
  modelOf,
  Node,
  Subgraph,
  toDot,
} from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

// Every object with attributes holds them itself, under the DOM's names
// (#1930); the names that follow Map and a node's or edge's `attributes`
// stay, deprecated, on the same attributes.

describe('every object with attributes takes the DOM names', () => {
  it.each([
    ['a graph', () => new Digraph()],
    ['a subgraph', () => new Subgraph('s')],
    ['a node', () => new Node('a')],
    ['an edge', () => new Edge([{ id: 'a' }, { id: 'b' }])],
    ['a default attribute statement', () => new AttributeList('Node')],
  ])('%s', (_, make) => {
    // Read through the common interface: the kinds take different keys.
    const model = make() as unknown as Attributes<AttributeKey>;
    model.setAttribute('label', 'L');
    model.setAttributes({ color: 'red' });
    expect(model.getAttribute('label')).toBe('L');
    expect(model.hasAttribute('color')).toBe(true);
    expect(model.getAttributeNames()).toEqual(['label', 'color']);
    model.removeAttribute('label');
    expect(model.hasAttribute('label')).toBe(false);
    model.removeAttributes();
    expect(model.getAttributeNames()).toEqual([]);
  });
});

describe("a node's and an edge's deprecated attributes", () => {
  it.each([
    ['a node', () => new Node('a')],
    ['an edge', () => new Edge([{ id: 'a' }, { id: 'b' }])],
  ])('%s: the same attributes as the object itself', (_, make) => {
    const model = make() as unknown as Attributes<AttributeKey> & {
      readonly attributes: Attributes<AttributeKey>;
    };
    model.attributes.set('label', 'L');
    expect(model.getAttribute('label')).toBe('L');
    model.setAttribute('color', 'red');
    expect(model.attributes.get('color')).toBe('red');
    expect(model.attributes.size).toBe(2);
    expect(model.attributes.values).toEqual([
      ['label', 'L'],
      ['color', 'red'],
    ]);
    model.attributes.delete('label');
    expect(model.hasAttribute('label')).toBe(false);
    model.attributes.clear();
    expect(model.getAttributeNames()).toEqual([]);
    // One object, not a model.
    expect(model.attributes).toBe(model.attributes);
    expect(model.attributes).not.toBe(model);
  });

  it('constructor attributes are the object’s own', () => {
    const node = new Node('a', { label: 'A' });
    const edge = new Edge([{ id: 'a' }, { id: 'b' }], { color: 'red' });
    expect(node.getAttribute('label')).toBe('A');
    expect(edge.getAttribute('color')).toBe('red');
  });
});

describe('the DSL', () => {
  it('has the DOM names with a $, and the attributes as properties', () => {
    const G = digraph((g) => {
      const a = g.node('a');
      a.$setAttribute('label', 'A');
      expect(a.label).toBe('A');
      a.color = 'red';
      expect(a.$getAttribute('color')).toBe('red');
      expect(a.$getAttributeNames()).toEqual(['label', 'color']);
      const e = g.edge(['a', 'b']);
      e.$setAttributes({ style: 'dashed' });
      expect(e.style).toBe('dashed');
      g.$setAttribute('rankdir', 'LR');
      expect(g.rankdir).toBe('LR');
    });
    expect(toDot(G)).toContain('rankdir = "LR";');
  });

  it("gives a node's deprecated $attributes as is (not a DSL)", () => {
    digraph((g) => {
      const a = g.node('a');
      a.$attributes.set('label', 'A');
      expect(a.label).toBe('A');
      expect(a.$attributes.get('label')).toBe('A');
      expect(Object.keys(a)).toEqual(['label']);
    });
  });
});

describe('the converters', () => {
  it('read and write the attributes through the new methods', () => {
    const g = fromDot(
      'digraph { a [label=A]; a [color=red]; a -> b [style=dashed]; }',
    );
    const a = g.getNode('a');
    expect(a?.getAttributeNames()).toEqual(['label', 'color']);
    expect(g.edges[0].getAttribute('style')).toBe('dashed');
    expect(toDot(g)).toBe(toDot(fromDot(toDot(g))));
  });

  it('a DSL model and its model share the attributes', () => {
    const G = digraph((g) => {
      g.node('a', { label: 'A' });
    });
    expect(modelOf(G).getNode('a')?.getAttribute('label')).toBe('A');
  });
});

describe('a class that overrides setAttribute', () => {
  it('sees a whole object from the constructor on', () => {
    const seen: string[] = [];
    class MyNode extends Node {
      override setAttribute(name: string, value: unknown): void {
        seen.push(`${this.id}.${name} ${this.attributes === undefined}`);
        super.setAttribute(name as 'label', value as string);
      }
    }
    class MyEdge extends Edge {
      override setAttribute(name: string, value: unknown): void {
        seen.push(`${this.targets.length}.${name}`);
        super.setAttribute(name as 'label', value as string);
      }
    }
    const node = new MyNode('a', { label: 'A' });
    new MyEdge([{ id: 'a' }, { id: 'b' }], { label: 'E' });
    node.attributes.set('color', 'red');
    expect(seen).toEqual(['a.label false', '2.label', 'a.color false']);
  });

  it('is not called for an edge whose targets are rejected', () => {
    const seen: string[] = [];
    class MyEdge extends Edge {
      override setAttribute(name: string, value: unknown): void {
        seen.push(name);
        super.setAttribute(name as 'label', value as string);
      }
    }
    expect(() => new MyEdge([{ id: 'a' }] as never, { label: 'E' })).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_INVALID_EDGE_TARGETS' }),
    );
    expect(seen).toEqual([]);
  });

  it('sees the writes of the DSL', () => {
    const seen: string[] = [];
    class MyNode extends Node {
      override setAttribute(name: string, value: unknown): void {
        seen.push(name);
        super.setAttribute(name as 'label', value as string);
      }
    }
    const view = dsl(new MyNode('b'));
    view.label = 'B';
    view.$setAttribute('color', 'red');
    view.$attributes.set('shape', 'box');
    expect(seen).toEqual(['label', 'color', 'shape']);
  });
});

describe('the DSL of an edge, and the members as values', () => {
  it("gives an edge's deprecated $attributes as is", () => {
    digraph((g) => {
      const e = g.edge(['a', 'b']);
      expect(e.$attributes).toBe(e.$attributes);
      e.$attributes.set('style', 'dashed');
      expect(e.style).toBe('dashed');
    });
  });

  it('a method taken off the DSL stays bound', () => {
    digraph((g) => {
      const a = g.node('a');
      const { $setAttribute, $removeAttribute } = a;
      $setAttribute('label', 'A');
      expect(a.label).toBe('A');
      $removeAttribute('label');
      expect({ ...a }).toEqual({});
      expect(Object.keys(a)).toEqual([]);
    });
  });
});
