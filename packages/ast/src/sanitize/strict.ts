import type { AttributeKey } from '@ts-graphviz/common';
import type { Tag } from './html.js';

/**
 * Every attribute ts-graphviz knows. Typed as a record of the generated
 * `AttributeKey` union, so the compiler rejects a missing or an extra name
 * when the generated types change.
 */
const KNOWN_ATTRIBUTES: Record<AttributeKey, true> = {
  Damping: true,
  K: true,
  TBbalance: true,
  URL: true,
  _background: true,
  area: true,
  arrowhead: true,
  arrowsize: true,
  arrowtail: true,
  bb: true,
  beautify: true,
  bgcolor: true,
  center: true,
  charset: true,
  class: true,
  cluster: true,
  clusterrank: true,
  color: true,
  colorscheme: true,
  comment: true,
  compound: true,
  concentrate: true,
  constraint: true,
  decorate: true,
  defaultdist: true,
  dim: true,
  dimen: true,
  dir: true,
  diredgeconstraints: true,
  distortion: true,
  dpi: true,
  edgeURL: true,
  edgehref: true,
  edgetarget: true,
  edgetooltip: true,
  epsilon: true,
  esep: true,
  fillcolor: true,
  fixedsize: true,
  fontcolor: true,
  fontname: true,
  fontnames: true,
  fontpath: true,
  fontsize: true,
  forcelabels: true,
  gradientangle: true,
  group: true,
  headURL: true,
  head_lp: true,
  headclip: true,
  headhref: true,
  headlabel: true,
  headport: true,
  headtarget: true,
  headtooltip: true,
  height: true,
  href: true,
  id: true,
  image: true,
  imagepath: true,
  imagepos: true,
  imagescale: true,
  inputscale: true,
  label: true,
  labelURL: true,
  label_scheme: true,
  labelangle: true,
  labeldistance: true,
  labelfloat: true,
  labelfontcolor: true,
  labelfontname: true,
  labelfontsize: true,
  labelhref: true,
  labeljust: true,
  labelloc: true,
  labeltarget: true,
  labeltooltip: true,
  landscape: true,
  layer: true,
  layerlistsep: true,
  layers: true,
  layerselect: true,
  layersep: true,
  layout: true,
  len: true,
  levels: true,
  levelsgap: true,
  lhead: true,
  lheight: true,
  linelength: true,
  lp: true,
  ltail: true,
  lwidth: true,
  margin: true,
  maxiter: true,
  mclimit: true,
  mindist: true,
  minlen: true,
  mode: true,
  model: true,
  newrank: true,
  nodesep: true,
  nojustify: true,
  normalize: true,
  notranslate: true,
  nslimit: true,
  nslimit1: true,
  oneblock: true,
  ordering: true,
  orientation: true,
  outputorder: true,
  overlap: true,
  overlap_scaling: true,
  overlap_shrink: true,
  pack: true,
  packmode: true,
  pad: true,
  page: true,
  pagedir: true,
  pencolor: true,
  penwidth: true,
  peripheries: true,
  pin: true,
  pos: true,
  quadtree: true,
  quantum: true,
  radius: true,
  rank: true,
  rankdir: true,
  ranksep: true,
  ratio: true,
  rects: true,
  regular: true,
  remincross: true,
  repulsiveforce: true,
  resolution: true,
  root: true,
  rotate: true,
  rotation: true,
  samehead: true,
  sametail: true,
  samplepoints: true,
  scale: true,
  searchsize: true,
  sep: true,
  shape: true,
  shapefile: true,
  showboxes: true,
  sides: true,
  size: true,
  skew: true,
  smoothing: true,
  sortv: true,
  splines: true,
  start: true,
  style: true,
  stylesheet: true,
  tailURL: true,
  tail_lp: true,
  tailclip: true,
  tailhref: true,
  taillabel: true,
  tailport: true,
  tailtarget: true,
  tailtooltip: true,
  target: true,
  tooltip: true,
  truecolor: true,
  vertices: true,
  viewport: true,
  voro_margin: true,
  weight: true,
  width: true,
  xdotversion: true,
  xlabel: true,
  xlp: true,
  z: true,
};

/** The attributes the strict policy allows: known ones, minus file access. */
const ALLOWED_ATTRIBUTES: ReadonlySet<string> = new Set<string>(
  Object.keys(KNOWN_ATTRIBUTES).filter(
    (key) =>
      ![
        'image',
        'imagepath',
        'fontpath',
        'shapefile',
        'stylesheet',
        '_background',
      ].includes(key),
  ),
);

/**
 * A value of an attribute without its own rule: numbers, keywords, point
 * and rectangle lists, layer and port names. No quotes, backslashes,
 * `< > & ( ) %` or line breaks.
 */
const TOKEN = /^[\p{L}\p{M}\p{N} _.,:;=+\-#/!@^*]*$/u;

/**
 * Why the strict policy rejects an attribute, or `undefined`. `ownRule`
 * says whether the default rules already give the value a grammar (text,
 * links, fonts, style, colors, shape).
 */
export function strictAttributeProblem(
  name: string,
  value: string,
  ownRule: boolean,
): string | undefined {
  if (!ALLOWED_ATTRIBUTES.has(name)) {
    return 'is not a Graphviz attribute ts-graphviz knows (strict policy)';
  }
  if (!ownRule && !TOKEN.test(value)) {
    return 'has a value with characters outside numbers, names and lists (strict policy)';
  }
  return undefined;
}

/** HTML-like label tags and their attributes, as Graphviz defines them, without IMG. */
const HTML_TAGS = new Map<string, ReadonlySet<string>>([
  [
    'table',
    new Set([
      'align',
      'bgcolor',
      'border',
      'cellborder',
      'cellpadding',
      'cellspacing',
      'color',
      'columns',
      'fixedsize',
      'gradientangle',
      'height',
      'href',
      'id',
      'port',
      'rows',
      'sides',
      'style',
      'target',
      'title',
      'tooltip',
      'valign',
      'width',
    ]),
  ],
  [
    'td',
    new Set([
      'align',
      'balign',
      'bgcolor',
      'border',
      'cellpadding',
      'cellspacing',
      'color',
      'colspan',
      'fixedsize',
      'gradientangle',
      'height',
      'href',
      'id',
      'port',
      'rowspan',
      'sides',
      'style',
      'target',
      'title',
      'tooltip',
      'valign',
      'width',
    ]),
  ],
  ['font', new Set(['color', 'face', 'point-size'])],
  ['br', new Set(['align'])],
  ...['tr', 'b', 'i', 'u', 'o', 's', 'sub', 'sup', 'hr', 'vr'].map(
    (tag) => [tag, new Set<string>()] as const,
  ),
]);

/** HTML-like attributes the default rules give a grammar of their own. */
const HTML_OWN_RULE = new Set([
  'href',
  'title',
  'tooltip',
  'face',
  'style',
  'color',
  'bgcolor',
]);

/** Why the strict policy rejects a tag of an HTML-like label, or `undefined`. */
export function strictTagProblem(tag: Tag): string | undefined {
  const attributes = HTML_TAGS.get(tag.name.toLowerCase());
  if (attributes === undefined) {
    return `contains <${tag.name}>, which is not an HTML-like label tag (strict policy)`;
  }
  for (const [name, value] of tag.attributes) {
    const key = name.toLowerCase();
    if (!attributes.has(key)) {
      return `has ${name} on <${tag.name}>, which Graphviz does not define (strict policy)`;
    }
    if (!HTML_OWN_RULE.has(key) && !TOKEN.test(value)) {
      return `has ${name} on <${tag.name}> with characters outside numbers, names and lists (strict policy)`;
    }
  }
  return undefined;
}
