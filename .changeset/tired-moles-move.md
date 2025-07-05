---
"@ts-graphviz/common": minor
---

Export type guard and node reference utility APIs

## New Public APIs

### Type Guard Functions
- **`isNodeModel(object: unknown): object is NodeModel`** - Type guard for NodeModel objects
- **`isEdgeModel(object: unknown): object is EdgeModel`** - Type guard for EdgeModel objects
- **`isSubgraphModel(object: unknown): object is SubgraphModel`** - Type guard for SubgraphModel objects
- **`isRootGraphModel(object: unknown): object is RootGraphModel`** - Type guard for RootGraphModel objects
- **`isAttributeListModel(object: unknown): object is AttributeListModel`** - Type guard for AttributeListModel objects

### Node Reference Utilities
- **`isForwardRefNode(object: unknown): object is ForwardRefNode`** - Type guard for ForwardRefNode objects
- **`isNodeRef(node: unknown): node is NodeRef`** - Type guard for NodeRef objects (NodeModel or ForwardRefNode)
- **`isNodeRefLike(node: unknown): node is NodeRefLike`** - Type guard for NodeRefLike objects (string or NodeRef)
- **`isNodeRefGroupLike(target: NodeRefLike | NodeRefGroupLike): target is NodeRefGroupLike`** - Type guard for arrays of NodeRefLike
- **`isCompass(c: string): c is Compass`** - Type guard for valid compass directions ('n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'c')

### Conversion Utilities
- **`toNodeRef(target: NodeRefLike): NodeRef`** - Converts NodeRefLike to structured NodeRef object
- **`toNodeRefGroup(targets: NodeRefGroupLike): NodeRefGroup`** - Converts array of NodeRefLike to array of NodeRef objects

### New Types
- **`FilterableModel`** - Union type of all model types that can be filtered using type guards

## Features

- **Enhanced Type Safety**: All functions provide strict runtime type checking with TypeScript type narrowing
- **Comprehensive Documentation**: Full JSDoc comments with usage examples for all public APIs
- **Node Reference Parsing**: Parse complex node reference strings like `"node1:port:n"` into structured objects
- **Compass Direction Validation**: Validate and work with Graphviz compass directions
