import * as adapter from '@ts-graphviz/adapter';
import { type Format, toBlob } from '@ts-graphviz/adapter';
import { digraph } from 'ts-graphviz';
import * as modelAdapter from 'ts-graphviz/adapter';
import { toBlob as toBlobFromModel } from 'ts-graphviz/adapter';
import { describe, expectTypeOf, it } from 'vitest';

// What users of the adapter get from its options and inference (#1744).
// The declarations themselves are in api-reports/.

describe('toBlob', () => {
  it('gives a Blob', () => {
    expectTypeOf(toBlob('digraph {}')).toEqualTypeOf<Promise<Blob>>();
  });

  it('ts-graphviz/adapter also takes a model', () => {
    expectTypeOf(toBlobFromModel(digraph())).toEqualTypeOf<Promise<Blob>>();
  });

  it('replaces toStream and toFile, which are gone', () => {
    expectTypeOf(adapter).not.toHaveProperty('toStream');
    expectTypeOf(adapter).not.toHaveProperty('toFile');
    expectTypeOf(modelAdapter).not.toHaveProperty('toStream');
    expectTypeOf(modelAdapter).not.toHaveProperty('toFile');
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

  it('take formats and layouts a plugin adds for one call only', () => {
    toBlob('', { customFormats: ['mp4'], format: 'mp4' });
    toBlob('', { customLayouts: ['my-layout'], layout: 'my-layout' });
    toBlobFromModel(digraph(), { customFormats: ['mp4'], format: 'mp4' });
    // @ts-expect-error a custom name must be listed, not only written
    toBlob('', { format: 'mp4' });
    // @ts-expect-error a custom name must be listed, not only written
    toBlob('', { layout: 'my-layout' });
    // @ts-expect-error a name listed for one call does not widen another
    toBlob('', { customFormats: ['webm'], format: 'mp4' });
    // @ts-expect-error a custom name given as a type argument must be listed too
    toBlob<'mp4'>('', { format: 'mp4' });
    // @ts-expect-error the same for a layout
    toBlob<never, 'my-layout'>('', { layout: 'my-layout' });
    toBlob<'mp4'>('', { customFormats: ['mp4'], format: 'mp4' });
    // neato's options still depend on the layout
    toBlob('', { customFormats: ['mp4'], layout: 'neato', noop: 1 });
    toBlob('', {
      customLayouts: ['my-layout'],
      layout: 'my-layout',
      // @ts-expect-error neato's option on another layout
      noop: 1,
    });
    // the type of Format itself is not widened
    expectTypeOf<'mp4'>().not.toExtend<Format>();
  });

  it('list the formats Graphviz writes to a file or stream', () => {
    expectTypeOf<
      'svg' | 'png' | 'pdf' | 'ps' | 'json' | 'xdot1.4'
    >().toExtend<Format>();
    // the interactive ones are left out
    expectTypeOf<'x11'>().not.toExtend<Format>();
  });
});
