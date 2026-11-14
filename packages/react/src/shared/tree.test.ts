import {
  attribute as _,
  Digraph,
  defaultModelKit,
  type NodeModel,
  toDot,
} from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import {
  clearChildren,
  createInstance,
  createText,
  createTree,
  type GraphInstance,
  HOST,
  insertChild,
  nextSiblingOf,
  parentOf,
  removeChild,
  setProp,
  setProps,
  sync,
} from './tree.js';

const node = (id: string, props: Record<string, unknown> = {}) =>
  createInstance(HOST.node, { id, ...props });
const edge = (targets: unknown[], props: Record<string, unknown> = {}) =>
  createInstance(HOST.edge, { targets, ...props });
const subgraph = (id: string, props: Record<string, unknown> = {}) =>
  createInstance(HOST.graph, {
    model: defaultModelKit.createSubgraph(id),
    ...props,
  }) as GraphInstance;

describe('the place of an element in the tree', () => {
  it('is its parent and what follows it there', () => {
    const tree = createTree(new Digraph(), defaultModelKit);
    const a = node('a');
    const text = createText();
    const x = subgraph('x');
    const b = node('b');
    expect(parentOf(a)).toBeNull();
    expect(nextSiblingOf(a)).toBeNull();

    insertChild(tree, a);
    insertChild(tree, x);
    insertChild(tree, text, x);
    insertChild(x, b);
    expect(parentOf(a)).toBe(tree);
    expect(parentOf(b)).toBe(x);
    expect(nextSiblingOf(a)).toBe(text);
    expect(nextSiblingOf(text)).toBe(x);
    expect(nextSiblingOf(x)).toBeNull();
    expect(nextSiblingOf(b)).toBeNull();
  });

  it('changes when the element is inserted somewhere else', () => {
    const tree = createTree(new Digraph(), defaultModelKit);
    const x = subgraph('x');
    const a = node('a');
    const b = node('b');
    insertChild(tree, x);
    insertChild(tree, a);
    insertChild(tree, b);

    insertChild(x, a);
    expect(tree.children).toEqual([x, b]);
    expect(x.children).toEqual([a]);
    expect(parentOf(a)).toBe(x);

    // Moved within its parent; an anchor that is not there means the end.
    insertChild(tree, b, x);
    expect(tree.children).toEqual([b, x]);
    insertChild(tree, b, a);
    expect(tree.children).toEqual([x, b]);
    // Before itself: where it is.
    insertChild(tree, x, x);
    expect(tree.children).toEqual([x, b]);
  });

  it('is nowhere after the element was removed', () => {
    const tree = createTree(new Digraph(), defaultModelKit);
    const a = node('a');
    const b = node('b');
    insertChild(tree, a);
    insertChild(tree, b);

    removeChild(a);
    removeChild(a);
    expect(parentOf(a)).toBeNull();
    expect(tree.children).toEqual([b]);

    clearChildren(tree);
    expect(parentOf(b)).toBeNull();
    expect(tree.children).toEqual([]);
  });
});

describe('sync', () => {
  it('makes the models of the tree, and takes them out with it', () => {
    const G = new Digraph('G');
    const tree = createTree(G, defaultModelKit);
    const x = subgraph('cluster_x', { [_.label]: 'X' });
    insertChild(tree, node('a', { [_.color]: 'red', comment: 'first' }));
    insertChild(tree, x);
    insertChild(x, node('b'));
    insertChild(tree, edge(['a', 'b']));
    expect(G.statements).toHaveLength(0);

    sync(tree);
    expect(toDot(G)).toMatchInlineSnapshot(`
      "digraph "G" {
        // first
        "a" [
          color = "red";
        ];
        subgraph "cluster_x" {
          label = "X";
          "b";
        }
        "a" -> "b";
      }"
    `);
    expect(tree.models).toHaveLength(4);

    clearChildren(tree);
    sync(tree);
    expect(G.statements).toHaveLength(0);
    expect(tree.models).toEqual([]);
  });

  it('gives the root graphs of a tree without a container', () => {
    const tree = createTree(undefined, defaultModelKit);
    const G = new Digraph('G');
    const root = createInstance(HOST.graph, { model: G });
    insertChild(tree, createText());
    insertChild(tree, root);
    insertChild(root as GraphInstance, node('a'));
    sync(tree);
    expect(tree.models).toEqual([G]);
    expect(G.nodes.map((model) => model.id)).toEqual(['a']);
  });

  it('adds again what a model class threw on', () => {
    let fail = true;
    class Throwing extends Digraph {
      override addNode(model: NodeModel): void {
        if (fail) {
          fail = false;
          throw new Error('addNode');
        }
        super.addNode(model);
      }
    }
    const G = new Throwing('G');
    const tree = createTree(G, defaultModelKit);
    insertChild(tree, node('a'));
    expect(() => sync(tree)).toThrow('addNode');
    expect(G.nodes).toHaveLength(0);

    sync(tree);
    expect(G.nodes.map((model) => model.id)).toEqual(['a']);
  });

  it('leaves out what is hidden', () => {
    const G = new Digraph('G');
    const tree = createTree(G, defaultModelKit);
    const a = node('a');
    insertChild(tree, a);
    sync(tree);
    const [model] = G.nodes;

    a.hidden = true;
    sync(tree);
    expect(G.nodes).toHaveLength(0);

    a.hidden = false;
    sync(tree);
    expect(G.nodes).toEqual([model]);
  });
});

describe('one prop at a time', () => {
  function rendered(props: Record<string, unknown> = {}) {
    const G = new Digraph('G');
    const tree = createTree(G, defaultModelKit);
    const a = node('a', props);
    insertChild(tree, a);
    sync(tree);
    return { G, tree, a, model: G.nodes[0] as NodeModel };
  }

  it('is kept for the model an element does not have yet', () => {
    const G = new Digraph('G');
    const tree = createTree(G, defaultModelKit);
    const a = node('a', { [_.color]: 'red', [_.shape]: 'box' });
    setProp(a, _.color, 'blue');
    setProp(a, _.shape, undefined);
    setProp(a, 'comment', 'note');
    insertChild(tree, a);
    sync(tree);
    const [model] = G.nodes;
    expect(model.getAttribute(_.color)).toBe('blue');
    expect(model.hasAttribute(_.shape)).toBe(false);
    expect(model.comments.map((comment) => comment.text)).toEqual(['note']);
  });

  it('sets and removes an attribute, and nothing else', () => {
    const { a, model } = rendered({ [_.color]: 'red', [_.shape]: 'box' });
    setProp(a, _.color, 'blue');
    setProp(a, _.label, 'A');
    setProp(a, _.shape, undefined);
    expect(model.getAttributeNames()).toEqual([_.color, _.label]);
    expect(model.getAttribute(_.color)).toBe('blue');
    expect(model.getAttribute(_.label)).toBe('A');
  });

  it('sets, changes and removes the comment', () => {
    const { a, model } = rendered();
    const texts = (): string[] => model.comments.map((c) => c.text);
    setProp(a, 'comment', 'one');
    expect(texts()).toEqual(['one']);
    setProp(a, 'comment', 'two');
    expect(texts()).toEqual(['two']);
    setProp(a, 'comment', undefined);
    expect(texts()).toEqual([]);
  });

  it('does not make an attribute of a prop that is not one', () => {
    const { a, model } = rendered();
    setProp(a, 'key', 'k');
    setProp(a, 'children', []);
    expect(model.getAttributeNames()).toEqual([]);
  });

  it('makes a new node for a new id, at the next sync', () => {
    const { G, tree, a, model } = rendered({ [_.color]: 'red' });
    setProp(a, 'id', 'a');
    sync(tree);
    expect(G.nodes).toEqual([model]);

    setProp(a, 'id', 'b');
    expect(G.nodes).toEqual([model]);
    sync(tree);
    expect(G.nodes).toHaveLength(1);
    expect(G.nodes[0]).not.toBe(model);
    expect(G.nodes[0].id).toBe('b');
    expect(G.nodes[0].getAttribute(_.color)).toBe('red');
  });

  it('keeps an edge while its targets are equal, and makes a new one when not', () => {
    const G = new Digraph('G');
    const tree = createTree(G, defaultModelKit);
    const e = edge(['a', 'b'], { [_.color]: 'red' });
    insertChild(tree, e);
    sync(tree);
    const [model] = G.edges;

    setProp(e, 'targets', ['a', 'b']);
    setProp(e, _.color, 'blue');
    sync(tree);
    expect(G.edges).toEqual([model]);
    expect(model.getAttribute(_.color)).toBe('blue');

    setProp(e, 'targets', ['a', 'c']);
    sync(tree);
    expect(G.edges).toHaveLength(1);
    expect(G.edges[0]).not.toBe(model);
    expect(G.edges[0].getAttribute(_.color)).toBe('blue');
  });

  it('updates the attributes, default lists and comment of a graph', () => {
    const G = new Digraph('G');
    const tree = createTree(G, defaultModelKit);
    const x = subgraph('cluster_x', { [_.label]: 'X', node: { shape: 'box' } });
    insertChild(tree, x);
    sync(tree);
    const { model } = x;

    setProp(x, _.label, 'Y');
    setProp(x, _.color, 'red');
    setProp(x, 'node', { shape: 'circle' });
    setProp(x, 'edge', { color: 'blue' });
    setProp(x, 'graph', undefined);
    setProp(x, 'comment', 'note');
    setProp(x, 'strict', true);
    setProp(x, 'model', model);
    expect(toDot(G)).toMatchInlineSnapshot(`
      "digraph "G" {
        // note
        subgraph "cluster_x" {
          label = "Y";
          color = "red";
          edge [
            color = "blue";
          ];
          node [
            shape = "circle";
          ];
        }
      }"
    `);

    setProp(x, _.color, undefined);
    setProp(x, 'comment', undefined);
    expect(model.getAttributeNames()).toEqual([_.label]);
    expect(model.comments).toHaveLength(0);
  });

  it('refuses another model for a graph element', () => {
    const x = subgraph('x');
    expect(() =>
      setProp(x, 'model', defaultModelKit.createSubgraph('y')),
    ).toThrow('A graph element keeps its model.');
  });

  it('gives a portal another target', () => {
    const G = new Digraph('G');
    const tree = createTree(G, defaultModelKit);
    const x = subgraph('x');
    const y = subgraph('y');
    const portal = createInstance(HOST.portal, { id: 'x' });
    insertChild(tree, x);
    insertChild(tree, y);
    insertChild(tree, portal);
    if (portal.kind === 'portal') insertChild(portal, node('a'));
    sync(tree);
    expect(x.model.nodes).toHaveLength(1);

    setProp(portal, 'id', 'y');
    setProp(portal, 'other', 1);
    sync(tree);
    expect(x.model.nodes).toHaveLength(0);
    expect(y.model.nodes).toHaveLength(1);
  });
});

describe('all props at once', () => {
  it('replaces the attributes of the model', () => {
    const G = new Digraph('G');
    const tree = createTree(G, defaultModelKit);
    const a = node('a', { [_.color]: 'red', [_.shape]: 'box' });
    insertChild(tree, a);
    sync(tree);
    setProps(a, { id: 'a', [_.label]: 'A' });
    expect(G.nodes[0].getAttributeNames()).toEqual([_.label]);
  });
});

describe('createInstance', () => {
  it('refuses an edge with fewer than two targets', () => {
    expect(() => edge(['a'])).toThrow('Edges must have at least 2 targets.');
  });

  it('refuses a type that is not an element of a graph', () => {
    expect(() => createInstance('div', {})).toThrow(
      new TypeError('<div> is not an element of a graph.'),
    );
    expect(() => createInstance('dot:b', {})).toThrow(
      new TypeError('<dot:b> can only be used in an HTML-like label.'),
    );
  });

  it('reads own props only', () => {
    const props = Object.create({ color: 'red' }) as Record<string, unknown>;
    props.id = 'a';
    const tree = createTree(new Digraph(), defaultModelKit);
    insertChild(tree, createInstance(HOST.node, props));
    sync(tree);
    expect(tree.models).toHaveLength(1);
    expect((tree.models[0] as NodeModel).getAttributeNames()).toEqual([]);
  });
});
