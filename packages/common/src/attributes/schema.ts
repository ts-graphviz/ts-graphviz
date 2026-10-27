import type {
  Attribute,
  AttributeKey,
  AttributeValueTypeNames,
  ClusterSubgraphAttributeKey,
  EdgeAttributeKey,
  GraphAttributeKey,
  NodeAttributeKey,
  SubgraphAttributeKey,
} from './attribute.js';
import type {
  AttributeValueTypes,
  ValueTypeName,
  ValueTypeNamesUsing,
  ValueTypes,
} from './value-types.js';

/**
 * What a {@link SchemaEntry} does with its type:
 *
 * - `add`: a new attribute of that type;
 * - `extend`: the built-in type, or that type (a union);
 * - `override`: that type instead of the built-in one.
 *
 * In the types, `add` on a built-in attribute acts as `override`; whether
 * it is allowed there is up to what creates the entries.
 *
 * @group Schema
 */
export type SchemaEntryMode = 'add' | 'extend' | 'override';

/**
 * One entry of a {@link Schema}: a type `T` and what to do with it.
 *
 * Only `mode` exists at run time; the type is carried by `~type`, which is
 * never set. `attr<T>()`, `attr.extend<T>()`, `attr.override<T>()`,
 * `values.extend<T>()` and `values.override<T>()` will create entries.
 *
 * @group Schema
 */
export interface SchemaEntry<
  T = unknown,
  Mode extends SchemaEntryMode = SchemaEntryMode,
> {
  readonly mode: Mode;
  /** Type only: never present at run time. */
  readonly '~type'?: { readonly type: T };
}

/**
 * The kinds of objects a {@link Schema} gives attributes to. A subgraph
 * whose id starts with `cluster` (or with `cluster: true`) takes the
 * `cluster` ones; any other subgraph the `subgraph` ones.
 * @group Schema
 */
export type SchemaKind = 'graph' | 'subgraph' | 'cluster' | 'node' | 'edge';

/**
 * The attributes of one kind in a {@link Schema}, by name.
 * @group Schema
 */
export type SchemaAttributeEntries = {
  readonly [key: string]: SchemaEntry;
};

/**
 * The `subgraph` or `cluster` attributes of a {@link Schema}. `cluster`
 * cannot be changed: its value decides which of the two a subgraph takes.
 * @group Schema
 */
export type SubgraphSchemaAttributeEntries = SchemaAttributeEntries & {
  readonly cluster?: never;
};

/**
 * The value types a {@link Schema} changes, by name. `style`, `arrowType`
 * and `compass` take strings, the words their values are built from.
 * @group Schema
 */
export type SchemaValueTypeEntries = {
  readonly [N in ValueTypeName]?: SchemaEntry<
    N extends 'style' | 'arrowType' | 'compass' ? string : unknown,
    'extend' | 'override'
  >;
};

/**
 * Attributes and value types beyond (or instead of) the built-in ones, for
 * the models of one context only.
 *
 * - `types` extends or overrides value types ({@link ValueTypes}), which
 *   changes every attribute that uses them;
 * - `graph`, `subgraph`, `cluster`, `node` and `edge` add attributes, or
 *   extend or override built-in ones, for that kind of object.
 *
 * For one attribute, an entry of its kind is applied after `types`: an
 * override replaces whatever `types` gives, and an extension adds to it.
 *
 * Models typed with a schema ({@link SchemaModelTypes}) are subtypes of the
 * models without one, so they can be passed wherever those are taken.
 *
 * @group Schema
 */
export interface Schema {
  readonly types?: SchemaValueTypeEntries;
  readonly graph?: SchemaAttributeEntries;
  readonly subgraph?: SubgraphSchemaAttributeEntries;
  readonly cluster?: SubgraphSchemaAttributeEntries;
  readonly node?: SchemaAttributeEntries;
  readonly edge?: SchemaAttributeEntries;
}

/**
 * The schema of no attributes: what models without a schema use.
 * @group Schema
 */
export type EmptySchema = Record<never, never>;

/**
 * The built-in attribute keys of each {@link SchemaKind}.
 * @group Schema
 */
export interface SchemaKindAttributeKeys {
  graph: GraphAttributeKey;
  subgraph: SubgraphAttributeKey;
  cluster: ClusterSubgraphAttributeKey;
  node: NodeAttributeKey;
  edge: EdgeAttributeKey;
}

type TypesOf<S> = S extends { readonly types: infer T extends object }
  ? T
  : EmptySchema;

type EntriesOf<S, Kind extends SchemaKind> = S extends {
  readonly [P in Kind]: infer A extends object;
}
  ? A
  : EmptySchema;

/** Apply an entry to the type `Base`. */
type Apply<Base, E> =
  E extends SchemaEntry<infer T, infer Mode> ? ApplyMode<Base, T, Mode> : Base;

/**
 * Distributes over `Mode`: an entry whose mode is not known to be one of
 * them (such as `SchemaEntry<T>`) gets the widest result, `Base | T`.
 */
type ApplyMode<Base, T, Mode> = Mode extends 'extend'
  ? Base | T
  : Mode extends 'add' | 'override'
    ? T
    : never;

/**
 * The value types after the changes `T` (a schema's `types`).
 * @group Schema
 */
export type SchemaValueTypes<T> = {
  [N in ValueTypeName]: N extends keyof T
    ? Apply<ValueTypes[N], T[N]>
    : ValueTypes[N];
};

/** The names in AttributeValueTypeNames that the changes `T` reach. */
type ChangedNames<T> = ValueTypeNamesUsing<keyof T & ValueTypeName>;

/** The type of the built-in attribute `K` after the value type changes `T`. */
type TypedAttribute<K extends AttributeKey, T> = [
  Extract<AttributeValueTypeNames[K], ChangedNames<T>>,
] extends [never]
  ? Attribute<K>
  : AttributeValueTypes<SchemaValueTypes<T>>[AttributeValueTypeNames[K]];

/** The built-in keys among `Keys` whose types the changes `T` reach. */
type ChangedKeys<Keys extends AttributeKey, T> = Keys extends AttributeKey
  ? [Extract<AttributeValueTypeNames[Keys], ChangedNames<T>>] extends [never]
    ? never
    : Keys
  : never;

/**
 * The attributes of one kind whose types the schema `S` adds or changes, by
 * key: its entries for that kind, and the built-in attributes of that kind
 * whose value types it changes. A key it does not list keeps its built-in
 * type; with no schema this has no keys.
 *
 * `S` is one schema: the models of a context have one. A union of schemas
 * keeps only what all of them have.
 * @group Schema
 */
export type SchemaAttributeTypes<S, Kind extends SchemaKind> = {
  [K in
    | (keyof EntriesOf<S, Kind> & string)
    | ChangedKeys<SchemaKindAttributeKeys[Kind], TypesOf<S>>]: Apply<
    K extends AttributeKey ? TypedAttribute<K, TypesOf<S>> : never,
    K extends keyof EntriesOf<S, Kind> ? EntriesOf<S, Kind>[K] : undefined
  >;
};

/**
 * {@link SchemaAttributeTypes} of a subgraph not known to be a cluster or
 * not: the `subgraph` and `cluster` ones, a key in both taking either type.
 * @group Schema
 */
export type SubgraphSchemaAttributeTypes<S> = {
  [K in
    | keyof SchemaAttributeTypes<S, 'subgraph'>
    | keyof SchemaAttributeTypes<S, 'cluster'>]:
    | KindAttributeType<S, 'subgraph', K>
    | KindAttributeType<S, 'cluster', K>;
};

type KindAttributeType<
  S,
  Kind extends SchemaKind,
  K extends PropertyKey,
> = K extends keyof SchemaAttributeTypes<S, Kind>
  ? SchemaAttributeTypes<S, Kind>[K]
  : K extends SchemaKindAttributeKeys[Kind]
    ? Attribute<K>
    : never;
