import { attr, defineSchema, values } from '@ts-graphviz/common';
import { describe, expect, it } from 'vitest';
import { sanitize } from './sanitize.js';

const unsafe = expect.objectContaining({ code: 'TSG_ERR_UNSAFE_DOT' });

const schema = defineSchema({
  types: { style: values.extend('sketchy') },
  node: { 'data-id': attr<number>(), tier: attr<string>() },
  edge: { weight2: attr<number>() },
});

describe('sanitize with a schema', { tags: ['SM-7'] }, () => {
  it('lets the strict policy allow the attributes of the schema', () => {
    const dot = 'digraph { a ["data-id"=1 tier=core]; a -> b [weight2=2] }';
    expect(() => sanitize(dot, { policy: 'strict', format: 'svg' })).toThrow(
      unsafe,
    );
    expect(() =>
      sanitize(dot, { policy: 'strict', format: 'svg', schema }),
    ).not.toThrow();
  });

  it('checks the values of those attributes as the strict policy does', () => {
    expect(() =>
      sanitize('digraph { a [tier="x(y)"] }', {
        policy: 'strict',
        format: 'svg',
        schema,
      }),
    ).toThrow(unsafe);
  });

  it('never allows an attribute that reads files, schema or not', () => {
    const withFile = defineSchema({
      node: { shapefile: attr.override<string>() },
      graph: { imagepath: attr.override<string>() },
    });
    for (const dot of [
      'digraph { a [shapefile="/etc/passwd"] }',
      'digraph { imagepath="/etc" }',
    ]) {
      expect(() => sanitize(dot, { schema: withFile })).toThrow(unsafe);
      expect(() =>
        sanitize(dot, { policy: 'strict', schema: withFile }),
      ).toThrow(unsafe);
    }
  });

  it('accepts the style names of the schema, in both policies', () => {
    const dot = 'digraph { a [style="filled,sketchy"] }';
    expect(() => sanitize(dot)).toThrow(unsafe);
    expect(() => sanitize(dot, { schema })).not.toThrow();
    expect(() =>
      sanitize(dot, { policy: 'strict', format: 'svg', schema }),
    ).not.toThrow();
    // A name of other characters than letters never matches.
    const odd = defineSchema({ types: { style: values.extend('a b') } });
    expect(() =>
      sanitize('digraph { a [style="a b"] }', { schema: odd }),
    ).toThrow(unsafe);
  });

  it('throws for a schema defineSchema does not take', () => {
    expect(() =>
      sanitize('digraph {}', { schema: { nodes: {} } as never }),
    ).toThrow(expect.objectContaining({ code: 'TSG_ERR_INVALID_SCHEMA' }));
  });
});

describe('sanitize with a schema, at its edges', { tags: ['SM-7'] }, () => {
  it('never allows a file-access attribute in any kind, schema or not', () => {
    const withFile = defineSchema({
      graph: {
        imagepath: attr.override<string>(),
        fontpath: attr.override<string>(),
      },
      node: {
        image: attr.override<string>(),
        shapefile: attr.override<string>(),
      },
      edge: { stylesheet: attr<string>() },
    });
    for (const dot of [
      'digraph { a [image="/etc/passwd"] }',
      'digraph { fontpath="/etc" }',
      'digraph { node [shapefile="/x"]; a }',
      'digraph { edge [stylesheet="/x.css"]; a -> b }',
      'digraph { _background="x" }',
    ]) {
      expect(() =>
        sanitize(dot, { policy: 'strict', format: 'svg', schema: withFile }),
      ).toThrow(unsafe);
    }
  });

  it('reads style names case-insensitively, as the built-in ones', () => {
    expect(() =>
      sanitize('digraph { a [style="SKETCHY"] }', { schema }),
    ).not.toThrow();
    expect(() =>
      sanitize('digraph { a [style="sketchy(1)"] }', { schema }),
    ).toThrow(unsafe);
  });
});
