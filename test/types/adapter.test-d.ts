import { type Format, toBlob } from '@ts-graphviz/adapter';
import { attr, defineSchema, digraph, values } from 'ts-graphviz';
import { toBlob as toBlobFromModel } from 'ts-graphviz/adapter';
import { describe, expectTypeOf, it } from 'vitest';

// What users of the adapter get from its options and inference.
// The declarations themselves are in api-reports/.

describe('toBlob', () => {
  it('gives a Blob', () => {
    expectTypeOf(toBlob('digraph {}')).toEqualTypeOf<Promise<Blob>>();
  });

  it('ts-graphviz/adapter also takes a model', () => {
    expectTypeOf(toBlobFromModel(digraph())).toEqualTypeOf<Promise<Blob>>();
  });

  it('type the options of each layout', () => {
    toBlob('', { format: 'png', layout: 'dot' });
    toBlob('', { layout: 'neato', noop: 1, reduce: true });
    toBlob('', { layout: 'fdp', grid: true, iterations: 10 });
    toBlob('', { sanitize: false, signal: AbortSignal.timeout(1000) });
    toBlob('', { attributes: { node: { shape: 'box' } } });
    // @ts-expect-error neato's option on another layout
    toBlob('', { layout: 'dot', noop: 1 });
    // @ts-expect-error not an output format
    toBlob('', { format: 'docx' });
  });

  it('take the formats, layouts and attributes of a schema', () => {
    const schema = defineSchema({
      types: {
        format: values.extend('mp4'),
        layout: values.extend('my-layout'),
      },
      node: { 'data-id': attr<number>() },
    });
    toBlob('', { schema, format: 'mp4' });
    toBlob('', { schema, layout: 'my-layout' });
    toBlob('', { schema, attributes: { node: { 'data-id': 1 } } });
    toBlobFromModel(digraph(), { schema, format: 'mp4' });
    // @ts-expect-error a name of a schema needs the schema
    toBlob('', { format: 'mp4' });
    // @ts-expect-error the same for a layout
    toBlob('', { layout: 'my-layout' });
    const other = defineSchema({ types: { format: values.extend('webm') } });
    // @ts-expect-error a schema widens with its own names only
    toBlob('', { schema: other, format: 'mp4' });
    // @ts-expect-error an attribute of the schema has its type
    toBlob('', { schema, attributes: { node: { 'data-id': 'x' } } });
    // neato's options still depend on the layout
    toBlob('', { schema, layout: 'neato', noop: 1 });
    toBlob('', {
      schema,
      layout: 'my-layout',
      // @ts-expect-error neato's option on another layout
      noop: 1,
    });
    // the type of Format itself is not widened
    expectTypeOf<'mp4'>().not.toExtend<Format>();
  });

  it('take names of formats and layouts only from values with names', () => {
    defineSchema({
      // @ts-expect-error a format needs its names at run time
      types: { format: values.extend<'mp4'>() },
    });
  });

  it('list the formats Graphviz writes to a file or stream', () => {
    expectTypeOf<
      'svg' | 'png' | 'pdf' | 'ps' | 'json' | 'xdot1.4'
    >().toExtend<Format>();
    // the interactive ones are left out
    expectTypeOf<'x11'>().not.toExtend<Format>();
  });
});

describe('toBlob given a schema type', () => {
  it('needs the schema itself', () => {
    const schema = defineSchema({ types: { format: values.extend('mp4') } });
    // @ts-expect-error the names are read from the schema at run time
    toBlob<typeof schema>('', { format: 'mp4' });
    toBlob<typeof schema>('', { schema, format: 'mp4' });
  });
});
