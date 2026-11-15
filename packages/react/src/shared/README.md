# The shared layer

What a renderer for any framework needs to turn its elements into models of
ts-graphviz. The React renderer around it is its first user; a test
(`vue-prototype.test.ts`) keeps a small renderer for Vue working on it.

It is internal: nothing here is exported from `@ts-graphviz/react`, and it
may change in any release.

## Rule

Code in this directory imports neither React (`react`, `react-reconciler`)
nor the code outside the directory. Biome checks it (`noRestrictedImports`
in `biome.json`).

## Parts

- `tree.ts`: the tree of elements a renderer keeps, and `sync()`, which makes
  the models match it.
  - Elements know their parent, so a renderer can ask for the parent of an
    element and for what follows it (`parentOf`, `nextSiblingOf`).
  - Props are given all at once (`setProps`) or one at a time (`setProp`).
  - Props reach the models at once: a graph element's model gets them when
    the element is made, and `setProps` and `setProp` set them on a model
    that is already there. What a graph has (its nodes, edges and
    subgraphs) waits for `sync()`. A renderer calls it when an update of
    its own is complete: React at a commit, Vue after its scheduler has
    flushed.
  - A new node id or other edge targets given with `setProp` make a new
    model at the next `sync()`. `setProps` takes them to be as before: a
    renderer that uses it makes a new element for a new identity, as React
    does with the key of an element.
  - The models of nodes and edges are made with the `ModelKit` of the tree.
- `label.ts`: HTML-like labels.
  - `htmlLikeFromSource` walks what a renderer has for a label; a resolver of
    the renderer tells, node by node, what it stands for (text, an element,
    a list, a component to call, a provider).
  - `htmlLikeFromTree` does the same for plain `{ type, props, children }`
    data.
  - The values that the providers of a label context give are kept here; a
    renderer has its own form of a context around them.
