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
import { urlProblem } from './url.js';

/**
 * Options of {@link sanitize}: the parser limits, which apply as in
 * {@link parse}.
 *
 * @group Sanitize DOT
 */
export type SanitizeOptions = CommonParseOptions;

/** Attributes that make Graphviz read a file, or reference one from the output. */
const FILE_ATTRIBUTES: Record<string, string> = {
  image: 'makes Graphviz read an image file',
  shapefile: 'makes Graphviz read a file',
  imagepath: 'sets where Graphviz reads image files',
  fontpath: 'sets where Graphviz reads font files',
  stylesheet: 'is written into SVG output as a stylesheet reference',
};

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

/** A font name with a path separator can name a font file to read. */
function isFontPath(value: string): boolean {
  return value.includes('/') || value.includes('\\');
}

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
  const fileProblem = FILE_ATTRIBUTES[key];
  if (fileProblem !== undefined) {
    throw unsafe(`${at} ${fileProblem}.`);
  }
  if (URL_ATTRIBUTES.has(key)) {
    const problem = urlProblem(value);
    if (problem !== undefined) throw unsafe(`${at} ${problem}.`);
  }
  if (FONT_ATTRIBUTES.has(key) && isFontPath(value)) {
    throw unsafe(`${at} names a font file.`);
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
      if (key === 'face' && isFontPath(value)) {
        throw unsafe(`${at}: ${name} on <${tag.name}> names a font file.`);
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
  }
  return undefined;
}

/**
 * Check a DOT source from an untrusted party before Graphviz renders it, and
 * return the DOT to render.
 *
 * Graphviz has no sandbox: some attributes make it read local files into
 * its output, and URLs are written into SVG as links. `sanitize` parses the
 * source (with the parser limits) and rejects:
 *
 * - `image`, `shapefile`, `imagepath`, `fontpath` and `stylesheet`;
 * - font names with a path separator (`fontname`, `labelfontname`, `FACE`);
 * - URL-like attributes (`URL`, `href`, `labelURL`, `HREF` in HTML-like
 *   labels, …) unless they are relative or use `http`, `https` or `mailto`;
 * - `<IMG>` and `SRC` in HTML-like strings, and markup it cannot read.
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
