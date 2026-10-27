import { type Format, toFile, toStream } from '@ts-graphviz/adapter';
import { digraph } from 'ts-graphviz';
import { toStream as toStreamFromModel } from 'ts-graphviz/adapter';
import { describe, expectTypeOf, it } from 'vitest';

// What users of the adapter get from its options and inference (#1744).
// The declarations themselves are in api-reports/.

describe('toStream / toFile', () => {
  it('give a web stream, or nothing once the file is written', () => {
    expectTypeOf(toStream('digraph {}')).toEqualTypeOf<
      Promise<ReadableStream<Uint8Array>>
    >();
    expectTypeOf(toFile('digraph {}', 'out.svg')).toEqualTypeOf<
      Promise<void>
    >();
  });

  it('ts-graphviz/adapter also takes a model', () => {
    expectTypeOf(toStreamFromModel(digraph())).toEqualTypeOf<
      Promise<ReadableStream<Uint8Array>>
    >();
  });

  it('type the options of each layout', () => {
    toStream('', { format: 'png', layout: 'dot' });
    toStream('', { layout: 'neato', noop: 1, reduce: true });
    toStream('', { layout: 'fdp', grid: true, iterations: 10 });
    toStream('', { sanitize: false, signal: AbortSignal.timeout(1000) });
    toStream('', { attributes: { node: { shape: 'box' } } });
    // @ts-expect-error neato's option on another layout
    toStream('', { layout: 'dot', noop: 1 });
    // @ts-expect-error not an output format
    toStream('', { format: 'docx' });
  });

  it('take formats and layouts a plugin adds for one call only', () => {
    toStream('', { customFormats: ['mp4'], format: 'mp4' });
    toStream('', { customLayouts: ['my-layout'], layout: 'my-layout' });
    toFile('', 'out.mp4', { customFormats: ['mp4'], format: 'mp4' });
    toStreamFromModel(digraph(), { customFormats: ['mp4'], format: 'mp4' });
    // @ts-expect-error a custom name must be listed, not only written
    toStream('', { format: 'mp4' });
    // @ts-expect-error a custom name must be listed, not only written
    toStream('', { layout: 'my-layout' });
    // @ts-expect-error a name listed for one call does not widen another
    toStream('', { customFormats: ['webm'], format: 'mp4' });
    // @ts-expect-error a custom name given as a type argument must be listed too
    toStream<'mp4'>('', { format: 'mp4' });
    // @ts-expect-error the same for a layout
    toStream<never, 'my-layout'>('', { layout: 'my-layout' });
    toStream<'mp4'>('', { customFormats: ['mp4'], format: 'mp4' });
    // neato's options still depend on the layout
    toStream('', { customFormats: ['mp4'], layout: 'neato', noop: 1 });
    toStream('', {
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
