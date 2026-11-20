import { describe, expect, it, test } from 'vitest';
import { attr, defineSchema, values } from './define-schema.js';
import { VALUE_TYPE_NAMES } from './value-types.js';

const invalid = expect.objectContaining({
  name: 'TypeError',
  code: 'TSG_ERR_INVALID_SCHEMA',
});

describe('attr and values', () => {
  it('create frozen entries of their mode', () => {
    expect(attr<string>()).toEqual({ mode: 'add' });
    expect(attr.extend<'x'>()).toEqual({ mode: 'extend' });
    expect(attr.override<number>()).toEqual({ mode: 'override' });
    expect(values.extend<'x'>()).toEqual({ mode: 'extend' });
    expect(values.override<'x'>()).toEqual({ mode: 'override' });
    expect(Object.isFrozen(attr<string>())).toBe(true);
    expect(Object.isFrozen(attr)).toBe(true);
    expect(Object.isFrozen(values)).toBe(true);
  });
});

describe('defineSchema', () => {
  it('gives the schema frozen, with its parts', () => {
    const schema = defineSchema({
      types: { color: values.extend<'brand-blue'>() },
      graph: { hoge: attr<string>() },
      subgraph: { lane: attr<number>() },
      cluster: { team: attr<'core'>() },
      node: { 'data-id': attr<number>(), label: attr.override<number>() },
      edge: { dir: attr.extend<'sideways'>() },
    });
    expect(schema).toEqual({
      types: { color: { mode: 'extend' } },
      graph: { hoge: { mode: 'add' } },
      subgraph: { lane: { mode: 'add' } },
      cluster: { team: { mode: 'add' } },
      node: { 'data-id': { mode: 'add' }, label: { mode: 'override' } },
      edge: { dir: { mode: 'extend' } },
    });
    expect(Object.isFrozen(schema)).toBe(true);
    expect(Object.isFrozen(schema.node)).toBe(true);
    expect(defineSchema({})).toEqual({});
  });

  it('gives a schema it made as it is', () => {
    const schema = defineSchema({ node: { a: attr<string>() } });
    expect(defineSchema(schema)).toBe(schema);
  });

  it('copies the schema it is given', () => {
    const node = { a: attr<string>() };
    const schema = defineSchema({ node });
    expect(schema.node).not.toBe(node);
    (node as Record<string, unknown>).b = attr<string>();
    expect(schema.node).toEqual({ a: { mode: 'add' } });
  });

  it('takes an entry from another copy of the package, by shape', () => {
    expect(
      defineSchema({ node: { a: Object.freeze({ mode: 'add' as const }) } }),
    ).toEqual({ node: { a: { mode: 'add' } } });
  });

  it('takes every value type', () => {
    const types = Object.fromEntries(
      VALUE_TYPE_NAMES.map((name) => [name, values.extend<'x'>()]),
    );
    expect(Object.keys(defineSchema({ types }).types ?? {})).toEqual(
      VALUE_TYPE_NAMES,
    );
  });

  it('holds entries of its own, which the caller cannot change', () => {
    const given = { mode: 'add' as const };
    const schema = defineSchema({ node: { a: given } });
    expect(schema.node?.a).not.toBe(given);
    (given as { mode: string }).mode = 'override';
    expect(schema.node?.a).toEqual({ mode: 'add' });
    expect(Object.isFrozen(schema.node?.a)).toBe(true);
  });

  it('takes an attribute named __proto__ as one, with no prototype to set', () => {
    const node = JSON.parse('{"__proto__": {"mode": "add"}}');
    const schema = defineSchema({ node } as never) as {
      node: Record<string, unknown>;
    };
    expect(Object.keys(schema.node)).toEqual(['__proto__']);
    expect(Object.getPrototypeOf(schema.node)).toBe(null);
  });

  test.each<[string, object]>([
    [
      'an entry',
      {
        node: {
          a: Object.defineProperty({}, 'mode', {
            get: () => 'add',
            enumerable: true,
          }),
        },
      },
    ],
    [
      'a part',
      Object.defineProperty({}, 'node', { get: () => ({}), enumerable: true }),
    ],
    [
      'an attribute',
      {
        node: Object.defineProperty({}, 'a', {
          get: () => attr<string>(),
          enumerable: true,
        }),
      },
    ],
  ])('throws for a getter in place of %s', (_, schema) => {
    expect(() => defineSchema(schema as never)).toThrow(invalid);
  });

  it('reads own properties only', () => {
    const proto = Object.prototype as Record<string, unknown>;
    proto.node = { a: attr<string>() };
    try {
      expect(defineSchema({})).toEqual({});
      expect(defineSchema({ graph: {} })).toEqual({ graph: {} });
    } finally {
      delete proto.node;
    }
  });

  test.each([
    ['not an object', 'node'],
    ['null', null],
    ['an array', []],
  ])('throws for a schema that is %s', (_, schema) => {
    expect(() => defineSchema(schema as never)).toThrow(invalid);
  });

  test.each<[string, unknown]>([
    ['an unknown part', { nodes: {} }],
    ['a part that is not an object', { node: 'a' }],
    ['a part that is an array', { node: [] }],
    ['an entry not made by attr', { node: { a: { mode: 'other' } } }],
    ['an entry with other fields', { node: { a: { mode: 'add', x: 1 } } }],
    ['a value that is not an entry', { node: { a: 'string' } }],
    ['an unknown value type', { types: { colour: values.extend<'x'>() } }],
    ['attr in types', { types: { color: attr<'x'>() } }],
    ['cluster in subgraph', { subgraph: { cluster: attr.override<'x'>() } }],
    ['cluster in cluster', { cluster: { cluster: attr.override<'x'>() } }],
    ['an attribute without a name', { node: { '': attr<string>() } }],
    ['an attribute name with NUL', { node: { 'a\0b': attr<string>() } }],
  ])('throws for %s', (_, schema) => {
    expect(() => defineSchema(schema as never)).toThrow(invalid);
  });
});
