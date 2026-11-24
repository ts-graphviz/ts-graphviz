import { withCode } from '../errors.js';
import type { DotValue } from '../values.js';
import type {
  Schema,
  SchemaEntry,
  SchemaEntryMode,
  SchemaKind,
  SchemaKindAttributeKeys,
} from './schema.js';
import { VALUE_TYPE_NAMES } from './value-types.js';

/**
 * No parameter when the type argument `T` is given; otherwise one that no
 * argument fits, so that a call without a type argument does not compile
 * (on TypeScript 5.0 too).
 */
type TypeArgumentRequired<T> = [T] extends [never]
  ? [typeArgumentRequired: never]
  : [];

function entry<T extends DotValue, Mode extends SchemaEntryMode>(
  mode: Mode,
): SchemaEntry<T, Mode> {
  return Object.freeze({ mode });
}

function add<T extends DotValue = never>(
  ..._: TypeArgumentRequired<T>
): SchemaEntry<T, 'add'> {
  return entry('add');
}

function extend<T extends DotValue = never>(
  ..._: TypeArgumentRequired<T>
): SchemaEntry<T, 'extend'> {
  return entry('extend');
}

function override<T extends DotValue = never>(
  ..._: TypeArgumentRequired<T>
): SchemaEntry<T, 'override'> {
  return entry('override');
}

/**
 * The entries of a schema's attributes, for {@link defineSchema}. Every
 * entry gives the type of the attribute: a call without a type argument does
 * not compile.
 *
 * - `attr<T>()`: an attribute that is not built in, of the type `T`;
 * - `attr.extend<T>()`: a built-in attribute that also takes `T`;
 * - `attr.override<T>()`: a built-in attribute that takes `T` instead of
 *   its built-in type.
 *
 * `attr<T>()` on a built-in attribute, and `attr.extend` or
 * `attr.override` on one that is not, are type errors in `defineSchema`.
 *
 * @group Schema
 */
export const attr: {
  <T extends DotValue = never>(
    ...typeArgumentRequired: TypeArgumentRequired<T>
  ): SchemaEntry<T, 'add'>;
  extend<T extends DotValue = never>(
    ...typeArgumentRequired: TypeArgumentRequired<T>
  ): SchemaEntry<T, 'extend'>;
  override<T extends DotValue = never>(
    ...typeArgumentRequired: TypeArgumentRequired<T>
  ): SchemaEntry<T, 'override'>;
} = Object.freeze(Object.assign(add, { extend, override }));

/**
 * The entries of a schema's value types (its `types`), for
 * {@link defineSchema}. Changing a value type changes every attribute that
 * uses it. Every entry gives its type: a call without a type argument does
 * not compile.
 *
 * - `values.extend<T>()`: the built-in value type, or `T`;
 * - `values.override<T>()`: `T` instead of the built-in value type.
 *
 * @group Schema
 */
export const values: {
  extend<T extends DotValue = never>(
    ...typeArgumentRequired: TypeArgumentRequired<T>
  ): SchemaEntry<T, 'extend'>;
  override<T extends DotValue = never>(
    ...typeArgumentRequired: TypeArgumentRequired<T>
  ): SchemaEntry<T, 'override'>;
} = Object.freeze({ extend, override });

/** The message of an entry that does not fit its attribute. */
type EntryErrors<Entries, BuiltIn> = {
  [K in keyof Entries]: Entries[K] extends SchemaEntry<DotValue, infer Mode>
    ? K extends BuiltIn
      ? [Mode] extends ['add']
        ? 'a built-in attribute: use attr.extend<T>() or attr.override<T>()'
        : unknown
      : [Mode] extends ['add']
        ? unknown
        : 'not a built-in attribute: use attr<T>()'
    : unknown;
};

/**
 * `S` where each entry fits its attribute; otherwise a type that the entry
 * does not fit, with the reason.
 * @group Schema
 */
export type SchemaErrors<S> = {
  [Kind in keyof S]: Kind extends SchemaKind
    ? EntryErrors<S[Kind], SchemaKindAttributeKeys[Kind]>
    : unknown;
};

const KINDS: ReadonlySet<string> = new Set<SchemaKind>([
  'graph',
  'subgraph',
  'cluster',
  'node',
  'edge',
]);
const VALUE_TYPES: ReadonlySet<string> = new Set(VALUE_TYPE_NAMES);
const SUBGRAPH_KINDS: ReadonlySet<string> = new Set(['subgraph', 'cluster']);

/** The schemas `defineSchema` made, which a kit takes as they are. */
const schemas = new WeakSet<object>();

function invalid(message: string): TypeError {
  return withCode(new TypeError(message), 'TSG_ERR_INVALID_SCHEMA');
}

const MODES: ReadonlySet<unknown> = new Set<SchemaEntryMode>([
  'add',
  'extend',
  'override',
]);

/**
 * The own enumerable properties of an object, which must be data
 * properties: a getter could give another value after the check.
 */
function ownData(value: object, part: string): [string, unknown][] {
  return Object.keys(value).map((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined || !('value' in descriptor)) {
      throw invalid(`${name(key)} in the ${part} of a schema must be a value`);
    }
    return [key, descriptor.value];
  });
}

/**
 * A new entry of the mode of `value`, if it is what `attr` and `values`
 * create, by shape (an entry from another copy of this package is one
 * too); otherwise `undefined`.
 */
function entryOf(value: unknown, part: string): SchemaEntry | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const fields = ownData(value, part);
  if (fields.length !== 1 || fields[0][0] !== 'mode') return undefined;
  const mode = fields[0][1];
  return MODES.has(mode) ? entry(mode as SchemaEntryMode) : undefined;
}

function name(key: string): string {
  return JSON.stringify(key.slice(0, 64));
}

/** A frozen copy of the entries of one part of a schema, checked. */
function entriesOf(
  value: unknown,
  part: string,
  check: (key: string, entry: SchemaEntry) => void,
): Record<string, SchemaEntry> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw invalid(`The ${part} of a schema must be an object`);
  }
  // No prototype: an attribute may be named `__proto__`.
  const copy: Record<string, SchemaEntry> = Object.create(null);
  // Own properties only: one inherited from Object.prototype is never an
  // entry. The entries are new ones, so the schema holds nothing the caller
  // can change.
  for (const [key, given] of ownData(value, part)) {
    const created = entryOf(given, part);
    if (created === undefined) {
      throw invalid(
        `${name(key)} in the ${part} of a schema must be an entry of attr or values`,
      );
    }
    check(key, created);
    copy[key] = created;
  }
  return Object.freeze(copy);
}

/**
 * Check a schema and give it frozen: the attributes and value types that the
 * models of a kit made with it take beyond (or instead of) the built-in
 * ones. Pass it to `createModelKit({ schema })`, `withModelKit({ schema })`
 * or `fromDot`'s `convert.models`; only the models of that kit are typed
 * with it.
 *
 * ```ts
 * const schema = defineSchema({
 *   types: { style: values.extend<'my-style'>() },
 *   graph: { hoge: attr<string>() },
 *   node: {
 *     'data-id': attr<number>(),
 *     label: attr.override<number>(),
 *   },
 * });
 * const { digraph } = withModelKit({ schema });
 * digraph((g) => {
 *   g.node('a', { 'data-id': 1, label: 2, style: 'my-style' });
 * });
 * ```
 *
 * - `types` changes value types ({@link ValueTypes}), and so every attribute
 *   that uses them; it takes `values.extend` and `values.override`.
 * - `graph`, `subgraph`, `cluster`, `node` and `edge` take the attributes of
 *   that kind of object: `attr<T>()` for one that is not built in,
 *   `attr.extend<T>()` or `attr.override<T>()` for a built-in one. A
 *   subgraph whose id starts with `cluster` (or with `cluster: true`) takes
 *   the `cluster` ones, any other subgraph the `subgraph` ones; neither
 *   changes `cluster` itself.
 *
 * The types are only types: models of a schema hold and print any value as
 * the others do.
 *
 * @throws TypeError (`TSG_ERR_INVALID_SCHEMA`) for anything else: a part not
 * listed above, an entry not created by `attr` or `values`, a value type
 * that is not one of {@link ValueTypes}, `attr` in `types`, or `cluster`
 * in `subgraph` or `cluster`.
 * @group Schema
 */
export function defineSchema<const S extends Schema>(
  schema: S & SchemaErrors<S>,
): S {
  if (typeof schema === 'object' && schema !== null && schemas.has(schema)) {
    return schema;
  }
  if (typeof schema !== 'object' || schema === null || Array.isArray(schema)) {
    throw invalid('A schema must be an object');
  }
  const defined: Record<string, unknown> = {};
  for (const [part, value] of ownData(schema, 'parts')) {
    if (part === 'types') {
      defined.types = entriesOf(value, 'types', (key, entry) => {
        if (!VALUE_TYPES.has(key)) {
          throw invalid(`${name(key)} is not a value type a schema changes`);
        }
        if (entry.mode === 'add') {
          throw invalid(
            `${name(key)} in the types of a schema must be values.extend or values.override`,
          );
        }
      });
    } else if (KINDS.has(part)) {
      defined[part] = entriesOf(value, part, (key) => {
        if (key === '') {
          throw invalid(`An attribute of a schema must have a name`);
        }
        if (key.includes('\0')) {
          throw invalid(`An attribute name of a schema must not contain NUL`);
        }
        if (key === 'cluster' && SUBGRAPH_KINDS.has(part)) {
          throw invalid(
            `cluster in the ${part} of a schema cannot be changed: it decides which a subgraph takes`,
          );
        }
      });
    } else {
      throw invalid(
        `${name(part)} is not a part of a schema (types, graph, subgraph, cluster, node, edge)`,
      );
    }
  }
  const frozen = Object.freeze(defined) as S;
  schemas.add(frozen);
  return frozen;
}
