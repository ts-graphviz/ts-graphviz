import {
  createRenderer,
  defineComponent,
  h,
  inject,
  nextTick,
  type PropType,
  provide,
  ref,
  type VNode,
} from '@vue/runtime-core';
import {
  attribute as _,
  Digraph,
  defaultModelKit,
  type EdgeTargetLikeTuple,
  type ModelKit,
  toDot,
} from 'ts-graphviz';
import { describe, expect, it, vi } from 'vitest';
import {
  type Child,
  createInstance,
  createText,
  createTree,
  edgeKey,
  HOST,
  type Instance,
  identityKey,
  insertChild,
  nextSiblingOf,
  parentOf,
  removeChild,
  setProp,
  sync,
  type Tree,
} from './tree.js';

// The shared layer is all a renderer needs: neither React nor its
// reconciler is loaded here.
vi.mock('react', () => {
  throw new Error('react was imported');
});
vi.mock('react-reconciler', () => {
  throw new Error('react-reconciler was imported');
});

/**
 * A renderer for Vue on the shared layer, for nodes, edges and subgraphs:
 * a prototype that shows the layer serves a framework that is not React.
 */
const { render } = createRenderer<Child, Instance | Tree>({
  createElement: (type, _namespace, _is, props) =>
    createInstance(type, props ?? {}),
  // Vue marks the ends of a fragment, and an absent branch, with these.
  createText,
  createComment: createText,
  setText: () => undefined,
  setElementText: () => undefined,
  patchProp: (element, key, _previous, next) => {
    if ('kind' in element) setProp(element, key, next ?? undefined);
  },
  insert: (child, parent, anchor) => {
    if ('children' in parent) insertChild(parent, child, anchor ?? undefined);
  },
  remove: removeChild,
  parentNode: parentOf,
  nextSibling: nextSiblingOf,
});

const KIT = Symbol('kit');

const Node = defineComponent({
  props: { id: { type: String, required: true } },
  inheritAttrs: false,
  setup:
    (props, { attrs }) =>
    () =>
      h(HOST.node, { ...attrs, id: props.id, key: props.id }),
});

const Edge = defineComponent({
  props: {
    targets: {
      type: Array as unknown as PropType<EdgeTargetLikeTuple>,
      required: true,
    },
  },
  inheritAttrs: false,
  setup:
    (props, { attrs }) =>
    () =>
      h(HOST.edge, {
        ...attrs,
        targets: props.targets,
        key: edgeKey(props.targets),
      }),
});

const Subgraph = defineComponent({
  props: { id: String },
  inheritAttrs: false,
  setup(props, { attrs, slots }) {
    const kit = inject<ModelKit>(KIT, defaultModelKit);
    return () => {
      // Made here, and added to its graph by the sync.
      const model = kit.createSubgraph(props.id);
      return h(
        HOST.graph,
        { ...attrs, model, key: identityKey(model) },
        slots.default?.(),
      );
    };
  },
});

/** Render into a tree for `container`, and make the models match. */
function mount(
  container: Digraph,
  content: () => VNode | (VNode | null)[],
): { tree: Tree; update(): Promise<void>; unmount(): void } {
  const tree = createTree(container, defaultModelKit);
  const Root = defineComponent({
    setup() {
      provide(KIT, tree.kit);
      return content;
    },
  });
  render(h(Root), tree);
  sync(tree);
  return {
    tree,
    // An update of Vue's has finished after the next tick.
    async update() {
      await nextTick();
      sync(tree);
    },
    unmount() {
      render(null, tree);
      sync(tree);
    },
  };
}

describe('a Vue renderer on the shared layer', () => {
  it('renders nodes, edges and subgraphs into a graph', () => {
    const G = new Digraph('G');
    mount(G, () => [
      h(Node, { id: 'a', [_.label]: 'A' }),
      h(Subgraph, { id: 'cluster_x', [_.label]: 'X' }, () => [
        h(Node, { id: 'b', [_.shape]: 'box' }),
      ]),
      h(Edge, { targets: ['a', 'b'], [_.color]: 'red' }),
    ]);
    expect(toDot(G)).toMatchInlineSnapshot(`
      "digraph "G" {
        "a" [
          label = "A";
        ];
        subgraph "cluster_x" {
          label = "X";
          "b" [
            shape = "box";
          ];
        }
        "a" -> "b" [
          color = "red";
        ];
      }"
    `);
  });

  it('adds nothing before the sync', () => {
    const G = new Digraph('G');
    const tree = createTree(G, defaultModelKit);
    render(h(Node, { id: 'a' }), tree);
    expect(G.nodes).toHaveLength(0);
    sync(tree);
    expect(G.nodes.map((node) => node.id)).toEqual(['a']);
  });

  it('updates one attribute and keeps the model', async () => {
    const G = new Digraph('G');
    const color = ref<string | undefined>('red');
    const { update } = mount(G, () =>
      h(Node, { id: 'a', [_.shape]: 'box', [_.color]: color.value }),
    );
    const [a] = G.nodes;
    expect(a.getAttribute(_.color)).toBe('red');

    color.value = 'blue';
    await update();
    expect(G.nodes).toEqual([a]);
    expect(a.getAttribute(_.color)).toBe('blue');
    expect(a.getAttribute(_.shape)).toBe('box');

    color.value = undefined;
    await update();
    expect(a.hasAttribute(_.color)).toBe(false);
    expect(a.getAttribute(_.shape)).toBe('box');
  });

  it('shows and takes out what a condition and a list render', async () => {
    const G = new Digraph('G');
    const ids = ref(['a', 'b', 'c']);
    const shown = ref(true);
    const { update } = mount(G, () => [
      ...ids.value.map((id) => h(Node, { id, key: id })),
      shown.value ? h(Edge, { targets: ['a', 'b'] }) : null,
      h(Node, { id: 'z' }),
    ]);
    const idsOf = (): string[] => G.nodes.map((node) => node.id);
    expect(idsOf()).toEqual(['a', 'b', 'c', 'z']);
    expect(G.edges).toHaveLength(1);
    const [a, , c] = G.nodes;

    ids.value = ['c', 'a'];
    shown.value = false;
    await update();
    expect(idsOf()).toEqual(['c', 'a', 'z']);
    expect(G.nodes[0]).toBe(c);
    expect(G.nodes[1]).toBe(a);
    expect(G.edges).toHaveLength(0);

    shown.value = true;
    await update();
    expect(G.edges).toHaveLength(1);
  });

  it('moves the content of a subgraph with it, and removes it on unmount', async () => {
    const G = new Digraph('G');
    G.addNode(defaultModelKit.createNode('own'));
    const inner = ref(['a']);
    const { update, unmount } = mount(G, () =>
      h(Subgraph, { id: 'cluster_x' }, () =>
        inner.value.map((id) => h(Node, { id })),
      ),
    );
    const [x] = G.subgraphs;
    expect(x.nodes.map((node) => node.id)).toEqual(['a']);

    inner.value = ['a', 'b'];
    await update();
    expect(G.subgraphs).toHaveLength(1);
    expect(G.subgraphs[0].nodes.map((node) => node.id)).toEqual(['a', 'b']);

    unmount();
    expect(G.subgraphs).toHaveLength(0);
    expect(G.nodes.map((node) => node.id)).toEqual(['own']);
  });
});
