import type { Format, Layout } from './types.js';

/**
 * Every {@link Format}, as the adapter accepts it at run time. A record, so
 * the compiler checks that it lists each name of the type and nothing else.
 */
const FORMATS: Readonly<Record<Format, true>> = {
  bmp: true,
  canon: true,
  cmap: true,
  cmapx: true,
  cmapx_np: true,
  dot: true,
  dot_json: true,
  eps: true,
  exr: true,
  fig: true,
  gd: true,
  gd2: true,
  gif: true,
  gv: true,
  ico: true,
  imap: true,
  imap_np: true,
  ismap: true,
  jp2: true,
  jpe: true,
  jpeg: true,
  jpg: true,
  json: true,
  json0: true,
  kitty: true,
  kittyz: true,
  mp: true,
  pct: true,
  pdf: true,
  pic: true,
  pict: true,
  plain: true,
  'plain-ext': true,
  png: true,
  pov: true,
  ps: true,
  ps2: true,
  psd: true,
  sgi: true,
  svg: true,
  svg_inline: true,
  svgz: true,
  tga: true,
  tif: true,
  tiff: true,
  tk: true,
  vdx: true,
  vml: true,
  vmlz: true,
  vrml: true,
  wbmp: true,
  webp: true,
  xdot: true,
  'xdot1.2': true,
  'xdot1.4': true,
  xdot_json: true,
};

/** Every {@link Layout}, as the adapter accepts it at run time. */
const LAYOUTS: Readonly<Record<Layout, true>> = {
  dot: true,
  neato: true,
  fdp: true,
  sfdp: true,
  circo: true,
  twopi: true,
  nop: true,
  nop2: true,
  osage: true,
  patchwork: true,
};

/**
 * Whether `value` is one of the output formats the adapter accepts as
 * `format`: exactly a {@link Format} name, without a `:renderer` suffix.
 *
 * Use it to check a format chosen by a request before rendering, e.g.
 * `isFormat(query.format) ? query.format : 'svg'`. The adapter makes the
 * same check and rejects anything else.
 *
 * @group Options
 */
export function isFormat(value: unknown): value is Format {
  return typeof value === 'string' && Object.hasOwn(FORMATS, value);
}

/**
 * Whether `value` is one of the layout engines the adapter accepts as
 * `layout`: exactly a {@link Layout} name.
 *
 * @group Options
 */
export function isLayout(value: unknown): value is Layout {
  return typeof value === 'string' && Object.hasOwn(LAYOUTS, value);
}
