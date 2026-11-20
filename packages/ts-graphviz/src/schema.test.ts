import { attr, defineSchema, modelOf, values } from '@ts-graphviz/common';
import { describe, expect, it } from 'vitest';
import { fromDot } from './from-dot.js';
import { withModelKit } from './model-factory.js';
import { toDot } from './to-dot.js';

const schema = defineSchema({
  types: { color: values.extend<'brand-blue'>() },
  graph: { hoge: attr<string>() },
  node: { 'data-id': attr<number>(), label: attr.override<number>() },
});

describe('a schema with the factories and fromDot', () => {
  it('writes the attributes of the schema as any other', () => {
    const { digraph } = withModelKit({ schema });
    const G = digraph('G', { hoge: 'x' }, (g) => {
      g.node('a', { 'data-id': 1, label: 2, color: 'brand-blue' });
    });
    expect(toDot(G)).toBe(
      [
        'digraph "G" {',
        '  hoge = "x";',
        '  "a" [',
        '    "data-id" = 1;',
        '    label = 2;',
        '    color = "brand-blue";',
        '  ];',
        '}',
      ].join('\n'),
    );
  });

  it('reads DOT with the kit of the schema', () => {
    const G = fromDot('digraph { a [label=2] }', {
      convert: { models: { schema } },
      dsl: true,
    });
    G.node('b', { 'data-id': 3 });
    expect(
      modelOf(G)
        .getNodes()
        .map((n) => n.id),
    ).toEqual(['a', 'b']);
  });

  it('throws for a schema it does not take', () => {
    expect(() => withModelKit({ schema: { nodes: {} } as never })).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_INVALID_SCHEMA' }),
    );
  });
});
