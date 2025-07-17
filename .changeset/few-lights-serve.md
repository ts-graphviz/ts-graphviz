---
"@ts-graphviz/core": patch
---

## Core Package TypeScript Type System Modernization

## 🔧 FIXES

### GraphBase Class Type Compatibility

**Fixed GraphBase class type compatibility issues:**
- **BREAKING INTERNAL**: Updated `GraphBase<T>` to `GraphBase<T, K>` to properly implement `GraphBaseModel<T, K>` interface
  - First generic parameter `T extends DotObjectType` represents the object type ('Graph', 'Subgraph', etc.)
  - Second generic parameter `K extends AttributeKey` represents the attribute key constraints
- **Added missing `$$type` property**: Abstract `$$type` property ensures proper implementation across subclasses
- **Enhanced type constraints**: Proper separation between object types and attribute types for better type safety

**Updated class hierarchy:**
```typescript
// Before
export abstract class GraphBase<T extends AttributeKey>
  extends AttributesBase<T>
  implements GraphBaseModel<T>

// After  
export abstract class GraphBase<T extends DotObjectType, K extends AttributeKey = AttributeKey>
  extends AttributesBase<K>
  implements GraphBaseModel<T, K>
{
  public abstract get $$type(): T;
}
```

**Cascading updates to subclasses:**
- `RootGraph`: Updated to `GraphBase<'Graph', GraphAttributeKey>`
- `Subgraph`: Updated to `GraphBase<'Subgraph', SubgraphAttributeKey | ClusterSubgraphAttributeKey>`
- Test classes: Added required `$$type` implementation

## 🚀 IMPROVEMENTS

### Type Safety Enhancement
- **Eliminated type compatibility errors**: All GraphBase-related type issues resolved using proper generic constraints
- **Maintained library TypeScript value**: Strong typing preserved throughout the core type system
- **Interface-implementation alignment**: GraphBase class now correctly implements GraphBaseModel interface requirements

### Enhanced Developer Experience
- **Better IntelliSense support**: Improved autocomplete and type checking for core graph classes
- **Clearer error messages**: More precise TypeScript errors when GraphBase subclasses are misused
- **Consistent type patterns**: Unified approach to handling object types vs attribute types

## 📊 TECHNICAL DETAILS

### Architecture Improvements
- **Generic type system enhancement**: Proper separation of concerns between object types (`DotObjectType`) and attribute constraints (`AttributeKey`)
- **Abstract property enforcement**: All GraphBase subclasses must properly implement `$$type` property
- **Type parameter ordering**: Consistent `<ObjectType, AttributeType>` pattern across the inheritance hierarchy

### Compatibility Notes
- **Runtime behavior unchanged**: All functional behavior remains identical
- **API surface unchanged**: No public API modifications for end users
- **Internal type system modernized**: Enhanced type safety without breaking changes

This update resolves TypeScript strict mode compilation errors in the core package while maintaining full backward compatibility and establishing a solid foundation for type-safe graph model development.
