---
"@ts-graphviz/common": major
"@ts-graphviz/core": major
"@ts-graphviz/ast": minor
"@ts-graphviz/react": minor
"ts-graphviz": major
---

Attributes live on every object that has them, under the DOM's names

Every object with attributes holds them itself: graphs, subgraphs, nodes, edges and default attribute statements. The methods take the names of the DOM's `Element`:

| 3.x | v4 |
| --- | --- |
| `node.attributes.set('label', 'A')` / `g.set(...)` | `node.setAttribute('label', 'A')` / `g.setAttribute(...)` |
| `get(key)` | `getAttribute(name)` |
| `delete(key)` | `removeAttribute(name)` |
| (none) | `hasAttribute(name)` |
| `values` | `getAttributeNames()` (and `getAttribute`) |
| `apply(object or entries)` | `setAttributes(object or entries)` |
| `clear()` | `removeAttributes()` |
| `size` | `getAttributeNames().length` |

They are typed with the schema as `get` and `set` are (#1854): the built-in attributes the schema keeps, the attributes it adds or changes, and keys in code generic over the schema.

Compared with 3.x:

- `NodeModel` and `EdgeModel` are attribute containers themselves (they extend `Attributes`, as graphs did), and `Node` and `Edge` extend `AttributesBase`. Their `attributes` keeps working, deprecated until v5: it is a view whose every method goes to the node or edge, so both name the same attributes.
- `get`, `set`, `delete`, `clear`, `apply`, `values` and `size` keep working where they existed, deprecated until v5.
- Every write goes through `setAttribute` (`setAttributes`, the constructor, the DSL, the converters, and the deprecated `set` and `apply`), and every read through `getAttribute`: a class that overrode `set`, `apply` or `get` overrides `setAttribute` or `getAttribute`. The attributes given to a constructor are set once the object's own fields are (a node's `id`, an edge's checked `targets`), so an override sees a whole object.
- The read-only types read through `getAttribute`, `hasAttribute` and `getAttributeNames` (`ReadonlyNodeModel` and `ReadonlyEdgeModel` are `ReadonlyAttributes` themselves); a model implemented by hand adds the new methods.
- `AttributesGroup` and `AttributesGroupModel` are deprecated (removed in v5): nothing creates a separate container any more. A default attribute statement stays an `AttributeList`, a statement with a kind.
- The DOT DSL keeps attributes as properties (`a.label = 'A'`); the methods are on the model (`modelOf(a).setAttribute(...)`).
