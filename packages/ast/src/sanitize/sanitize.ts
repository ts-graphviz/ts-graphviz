import { withCode } from '@ts-graphviz/common';
import type { CommonParseOptions } from '../dot-shim/parser/index.js';
import { Pipeline } from '../pipeline/pipeline.js';
import type {
  ASTNode,
  AttributeASTNode,
  DotASTNode,
  LiteralASTNode,
} from '../types.js';
import { readTags } from './html.js';
import { readings, urlProblem } from './url.js';

/**
 * Options of {@link sanitize}: the parser limits, which apply as in
 * {@link parse}.
 *
 * @group Sanitize DOT
 */
export type SanitizeOptions = CommonParseOptions;

/** Attributes that make Graphviz read a file, or reference one from the output. */
const FILE_ATTRIBUTES = new Map([
  ['image', 'makes Graphviz read an image file'],
  ['shapefile', 'makes Graphviz read a file'],
  ['imagepath', 'sets where Graphviz reads image files'],
  ['fontpath', 'sets where Graphviz reads font files'],
  ['stylesheet', 'is written into SVG output as a stylesheet reference'],
  // xdot drawing programs: Graphviz runs them, and they name fonts (`F`)
  // and images (`I`) of their own.
  ...['_draw_', '_ldraw_', '_hdraw_', '_tdraw_', '_hldraw_', '_tldraw_'].map(
    (key) => [key, 'is an xdot drawing program'] as const,
  ),
  ['_background', 'is an xdot drawing program'],
]);

/** Attributes Graphviz writes into the output as links. */
const URL_ATTRIBUTES = new Set([
  'url',
  'href',
  'edgeurl',
  'edgehref',
  'headurl',
  'headhref',
  'tailurl',
  'tailhref',
  'labelurl',
  'labelhref',
]);

const FONT_ATTRIBUTES = new Set(['fontname', 'labelfontname']);

/**
 * Letters, digits and the punctuation of fontconfig patterns
 * (`DejaVu Sans:style=Bold`).
 */
const PLAIN_FONT_NAME = /^[\p{L}\p{M}\p{N} _.,:=+-]*$/u;

/**
 * Whether a font name, in any reading (`&#47;` is `/` to the XML parser of
 * HTML-like labels), is more than a plain name: a path separator can name a
 * font file to read, and Graphviz writes the name raw into PostScript
 * output, where `(`, `)`, `%` or a line break is code (Graphviz 2.43).
 */
function isUnsafeFontName(value: string): boolean {
  const levels = readings(value);
  return (
    levels === undefined || levels.some((level) => !PLAIN_FONT_NAME.test(level))
  );
}

/**
 * Graphviz writes graph, cluster and node names and the `comment` attribute
 * raw into PostScript comments, so a line break ends the comment and the
 * rest of the line is code (Graphviz 2.43).
 */
const LINE_BREAK = /[\n\r\f]/;

/** The text of a literal as Graphviz reads it. */
function textOf(literal: LiteralASTNode): string {
  // A quoted literal keeps escapes as written; Graphviz only turns `\"`
  // into `"` (line continuations are already removed by the parser).
  return literal.quoted === true
    ? literal.value.replaceAll('\\"', '"')
    : literal.value;
}

function where(node: ASTNode): string {
  const start = (
    node as { location?: { start: { line: number; column: number } } }
  ).location?.start;
  return start ? ` (line ${start.line}, column ${start.column})` : '';
}

function unsafe(message: string) {
  return withCode(
    new DOMException(`Unsafe DOT: ${message}`, 'SecurityError'),
    'TSG_ERR_UNSAFE_DOT',
  );
}

function checkAttribute(attribute: AttributeASTNode): void {
  const name = textOf(attribute.key);
  const key = name.toLowerCase();
  const value = textOf(attribute.value);
  const at = `attribute "${name}"${where(attribute)}`;
  const fileProblem = FILE_ATTRIBUTES.get(key);
  if (fileProblem !== undefined) {
    throw unsafe(`${at} ${fileProblem}.`);
  }
  if (URL_ATTRIBUTES.has(key)) {
    const problem = urlProblem(value);
    if (problem !== undefined) throw unsafe(`${at} ${problem}.`);
  }
  if (FONT_ATTRIBUTES.has(key) && isUnsafeFontName(value)) {
    throw unsafe(`${at} is not a plain font name.`);
  }
  if (key === 'comment' && LINE_BREAK.test(value)) {
    throw unsafe(`${at} contains a line break.`);
  }
}

function checkId(literal: LiteralASTNode | undefined): void {
  if (literal !== undefined && LINE_BREAK.test(textOf(literal))) {
    throw unsafe(`name${where(literal)} contains a line break.`);
  }
}

function checkHtml(literal: LiteralASTNode): void {
  const at = `HTML-like string${where(literal)}`;
  const tags = readTags(literal.value);
  if (tags === undefined) {
    throw unsafe(`${at} cannot be read as markup.`);
  }
  for (const tag of tags) {
    if (tag.name.toLowerCase() === 'img') {
      throw unsafe(`${at} contains <${tag.name}>, which reads an image file.`);
    }
    for (const [name, value] of tag.attributes) {
      const key = name.toLowerCase();
      if (key === 'src') {
        throw unsafe(`${at} has ${name} on <${tag.name}>, which reads a file.`);
      }
      if (key === 'href' || key === 'url') {
        const problem = urlProblem(value);
        if (problem !== undefined) {
          throw unsafe(`${at}: ${name} on <${tag.name}> ${problem}.`);
        }
      }
      if (key === 'face' && isUnsafeFontName(value)) {
        throw unsafe(
          `${at}: ${name} on <${tag.name}> is not a plain font name.`,
        );
      }
    }
  }
}

/** Every AST node reachable from `node`, `node` included. */
function* walk(node: ASTNode): Generator<ASTNode> {
  yield node;
  for (const value of Object.values(node)) {
    for (const child of Array.isArray(value) ? value : [value]) {
      if (typeof child === 'object' && child !== null && 'type' in child) {
        yield* walk(child as ASTNode);
      }
    }
  }
}

/**
 * The transformer behind {@link sanitize}: throws on the first finding and
 * leaves the AST unchanged.
 */
function checkSafety(ast: DotASTNode): undefined {
  for (const node of walk(ast)) {
    if (node.type === 'Attribute') checkAttribute(node);
    if (node.type === 'Literal' && node.quoted === 'html') checkHtml(node);
    if (
      node.type === 'Graph' ||
      node.type === 'Subgraph' ||
      node.type === 'Node' ||
      node.type === 'NodeRef'
    ) {
      checkId(node.id);
    }
  }
  return undefined;
}

/**
 * Check a DOT source from an untrusted party before Graphviz renders it, and
 * return the DOT to render.
 *
 * Graphviz has no sandbox: some attributes make it read local files into
 * its output, URLs are written into SVG and image maps as links, and some
 * values are written raw into PostScript. `sanitize` parses the source (with
 * the parser limits) and rejects:
 *
 * - `image`, `shapefile`, `imagepath`, `fontpath`, `stylesheet` and the
 *   xdot drawing programs (`_draw_`, …, `_background`);
 * - font names (`fontname`, `labelfontname`, `FACE`) other than plain
 *   names: letters, digits and `space _ . , : = + -`;
 * - line breaks in graph, cluster and node names and in `comment`;
 * - URL-like attributes (`URL`, `href`, `labelURL`, `HREF` in HTML-like
 *   labels, …) unless they are relative or use `http`, `https` or `mailto`,
 *   and any containing whitespace, control characters or backslash escapes;
 * - `<IMG>` and `SRC` in HTML-like strings, and markup it cannot read.
 *
 * URLs and font names are checked at every level of character-reference
 * decoding.
 *
 * Attribute names are compared case-insensitively. Layout and size
 * attributes are not checked: bound their cost with the limits of the
 * adapter instead.
 *
 * The returned text is printed from the checked AST, never copied from the
 * input, so Graphviz reads what was checked. Render that text, not the input.
 *
 * @param dot - The DOT source.
 * @param options - Parser limits.
 * @returns The checked DOT source.
 * @throws `DOMException` named `SecurityError` with `code`
 * `TSG_ERR_UNSAFE_DOT` when the source is unsafe to render.
 * @throws {@link DotSyntaxError} when the source does not parse.
 * @group Sanitize DOT
 */
export function sanitize(dot: string, options?: SanitizeOptions): string {
  return new Pipeline({ parse: options }).use(checkSafety).process(dot);
}
