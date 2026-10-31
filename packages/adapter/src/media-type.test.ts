import { describe, expect, it } from 'vitest';
import { mediaType, outputBlob, outputPart } from './media-type.js';

describe('mediaType', () => {
  it('is the type of SVG without a format', () => {
    expect(mediaType()).toBe('image/svg+xml');
    expect(mediaType(undefined)).toBe('image/svg+xml');
  });

  it.each([
    ['svg', 'image/svg+xml'],
    ['svg_inline', 'image/svg+xml'],
    ['png', 'image/png'],
    ['jpg', 'image/jpeg'],
    ['jpeg', 'image/jpeg'],
    ['jpe', 'image/jpeg'],
    ['gif', 'image/gif'],
    ['webp', 'image/webp'],
    ['bmp', 'image/bmp'],
    ['tif', 'image/tiff'],
    ['tiff', 'image/tiff'],
    ['jp2', 'image/jp2'],
    ['pdf', 'application/pdf'],
    ['ps', 'application/postscript'],
    ['ps2', 'application/postscript'],
    ['eps', 'application/postscript'],
    ['json', 'application/json'],
    ['json0', 'application/json'],
    ['dot_json', 'application/json'],
    ['xdot_json', 'application/json'],
    ['dot', 'text/vnd.graphviz'],
    ['gv', 'text/vnd.graphviz'],
    ['canon', 'text/vnd.graphviz'],
    ['xdot', 'text/vnd.graphviz'],
    ['xdot1.2', 'text/vnd.graphviz'],
    ['xdot1.4', 'text/vnd.graphviz'],
  ])('%s is %s', (format, type) => {
    expect(mediaType(format)).toBe(type);
  });

  it('is empty for formats without a well-known type', () => {
    for (const format of [
      'plain',
      'plain-ext',
      'cmapx',
      'imap',
      'svgz',
      'vml',
      'fig',
      'kitty',
    ]) {
      expect(mediaType(format), format).toBe('');
    }
  });

  it('reads the format before a renderer suffix', () => {
    expect(mediaType('png:cairo')).toBe('image/png');
    expect(mediaType('svg:cairo:cairo')).toBe('image/svg+xml');
    expect(mediaType('mp4:ffmpeg')).toBe('');
  });

  it('is empty for custom formats and names of Object.prototype', () => {
    for (const format of [
      'mp4',
      'PNG',
      '',
      'constructor',
      '__proto__',
      'toString',
      'hasOwnProperty',
    ]) {
      expect(mediaType(format), format).toBe('');
    }
  });
});

describe('outputBlob', () => {
  it('joins the parts into a Blob of the format', async () => {
    const encoder = new TextEncoder();
    const blob = outputBlob(
      [outputPart(encoder.encode('<svg')), outputPart(encoder.encode('/>'))],
      undefined,
    );
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/svg+xml');
    expect(blob.size).toBe(6);
    expect(await blob.text()).toBe('<svg/>');
  });

  it('keeps the bytes as they are', async () => {
    const bytes = new Uint8Array([0, 13, 10, 255, 10]);
    const blob = outputBlob([outputPart(bytes)], 'png');
    expect(new Uint8Array(await blob.arrayBuffer())).toStrictEqual(bytes);
  });

  it('does not hold the chunks it was made from', async () => {
    const chunk = new Uint8Array([1, 2, 3]);
    const blob = outputBlob([outputPart(chunk)], 'png');
    chunk.fill(0);
    expect(new Uint8Array(await blob.arrayBuffer())).toStrictEqual(
      new Uint8Array([1, 2, 3]),
    );
  });

  it('is empty without output', async () => {
    const blob = outputBlob([], 'mp4');
    expect(blob.size).toBe(0);
    expect(blob.type).toBe('');
  });
});
