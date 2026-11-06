import type { Format } from './types.js';

const GRAPHVIZ = 'text/vnd.graphviz';
const JSON_TYPE = 'application/json';
const JPEG = 'image/jpeg';
const POSTSCRIPT = 'application/postscript';
const SVG = 'image/svg+xml';
const TIFF = 'image/tiff';

/**
 * The media types of the output formats that have a well-known one. The
 * others (image maps, `plain`, compressed or tool-specific formats) are
 * left out, and their Blobs get the empty type. No charset is claimed:
 * Graphviz writes the encoding the graph's `charset` attribute asks for.
 */
const MEDIA_TYPES: Readonly<Partial<Record<Format, string>>> = {
  __proto__: null,
  bmp: 'image/bmp',
  canon: GRAPHVIZ,
  dot: GRAPHVIZ,
  dot_json: JSON_TYPE,
  eps: POSTSCRIPT,
  gif: 'image/gif',
  gv: GRAPHVIZ,
  jp2: 'image/jp2',
  jpe: JPEG,
  jpeg: JPEG,
  jpg: JPEG,
  json: JSON_TYPE,
  json0: JSON_TYPE,
  pdf: 'application/pdf',
  png: 'image/png',
  ps: POSTSCRIPT,
  ps2: POSTSCRIPT,
  svg: SVG,
  svg_inline: SVG,
  tif: TIFF,
  tiff: TIFF,
  webp: 'image/webp',
  xdot: GRAPHVIZ,
  'xdot1.2': GRAPHVIZ,
  'xdot1.4': GRAPHVIZ,
  xdot_json: JSON_TYPE,
} as Readonly<Partial<Record<Format, string>>>;

/**
 * The media type of the output of `format` (`svg` by default), read from
 * its name before any `:renderer` suffix, so that a custom format such as
 * `png:cairo` gets the type of `png`. The empty string when there is none.
 */
export function mediaType(format = 'svg'): string {
  const base = format.split(':')[0] as Format;
  return Object.hasOwn(MEDIA_TYPES, base) ? (MEDIA_TYPES[base] as string) : '';
}

const PART_SIZE = 64 * 1024;

/**
 * The output of a command, collected into a Blob as it arrives.
 *
 * Chunks are copied into Blobs of about 64 KiB and then released, so the
 * output is held once (plus at most one part) instead of twice, as it would
 * be when copying all the chunks into one Blob at the end, and many small
 * chunks do not each become a Blob of their own. The final Blob references
 * the parts without copying them again.
 */
export class OutputParts {
  #parts: Blob[] = [];
  #pending: Uint8Array<ArrayBuffer>[] = [];
  #pendingSize = 0;

  push(chunk: Uint8Array): void {
    this.#pending.push(chunk as Uint8Array<ArrayBuffer>);
    this.#pendingSize += chunk.byteLength;
    if (this.#pendingSize >= PART_SIZE) this.#flush();
  }

  /**
   * The output as one Blob of the type of `format`. The options object has
   * no prototype: an inherited `endings` or `type` is never read.
   */
  toBlob(format: string | undefined): Blob {
    this.#flush();
    return new Blob(this.#parts, {
      __proto__: null,
      type: mediaType(format),
    } as ConstructorParameters<typeof Blob>[1]);
  }

  #flush(): void {
    if (this.#pending.length === 0) return;
    this.#parts.push(new Blob(this.#pending));
    this.#pending = [];
    this.#pendingSize = 0;
  }
}
