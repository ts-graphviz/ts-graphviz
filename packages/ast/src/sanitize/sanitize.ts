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
 * Options of {@link sanitize}.
 *
 * @group Sanitize DOT
 */
export interface SanitizeOptions extends CommonParseOptions {
  /**
   * The output format the DOT will be rendered to (`-T` value, e.g. `svg`
   * or `png:cairo`). With a format, `sanitize` also applies that format's
   * rules and rejects formats whose output has not been checked; the
   * adapter passes its `format`. Without one, only the rules shared by all
   * checked formats apply.
   */
  format?: string;
}

/**
 * The output formats the rules were checked against with Graphviz 2.43, by
 * `-T` value without a renderer suffix.
 */
const CHECKED_FORMATS = new Set([
  'svg',
  'svgz',
  'png',
  'jpg',
  'jpeg',
  'jpe',
  'gif',
  'webp',
  'pdf',
  'json',
  'json0',
  'dot_json',
  'xdot_json',
  'xdot',
  'dot',
  'gv',
  'canon',
  'plain',
  'plain-ext',
  'ps',
  'ps2',
  'eps',
  'imap',
  'imap_np',
  'cmapx',
  'cmapx_np',
]);

/** Formats that are PostScript programs: font names are written as code. */
const POSTSCRIPT_FORMATS = new Set(['ps', 'ps2', 'eps']);

/** Formats of space-separated raw fields, one record per line. */
const PLAIN_FORMATS = new Set(['plain', 'plain-ext']);

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
 * Text attributes whose character references Graphviz decodes itself
 * (named ones included) before escaping them for the output.
 */
const TEXT_ATTRIBUTES = new Set([
  'label',
  'xlabel',
  'headlabel',
  'taillabel',
  'tooltip',
  'labeltooltip',
  'edgetooltip',
  'headtooltip',
  'tailtooltip',
]);

/**
 * Style names Graphviz knows. It writes the style raw into PostScript
 * output, names and arguments alike, so anything else would be code
 * (Graphviz 2.43).
 */
const STYLE_NAMES = new Set([
  'solid',
  'dashed',
  'dotted',
  'bold',
  'invis',
  'invisible',
  'filled',
  'rounded',
  'diagonals',
  'striped',
  'wedged',
  'radial',
  'tapered',
]);

const STYLE_ITEM =
  /[ \t]*(?:([A-Za-z]+)|setlinewidth[ \t]*\([ \t]*(?:\d+\.?\d*|\.\d+)[ \t]*\))[ \t]*(?:,|$)/y;

/**
 * Whether every item of a `style` value is a known style or
 * `setlinewidth(n)`, with spaces only where the format allows them: `plain`
 * output writes the style as one raw field (Graphviz 2.43).
 */
function isKnownStyle(value: string, rules: FormatRules): boolean {
  if (!rules.spacesInStyle && /\s/.test(value)) return false;
  let i = 0;
  while (i < value.length) {
    STYLE_ITEM.lastIndex = i;
    const match = STYLE_ITEM.exec(value);
    if (!match || STYLE_ITEM.lastIndex === i) return false;
    if (match[1] !== undefined && !STYLE_NAMES.has(match[1].toLowerCase())) {
      return false;
    }
    i = STYLE_ITEM.lastIndex;
  }
  return true;
}

/**
 * Letters, digits and the punctuation of fontconfig patterns
 * (`DejaVu Sans:style=Bold`); spaces only where PostScript is not written.
 */
const PLAIN_FONT_NAME = /^[\p{L}\p{M}\p{N} _.,:=+-]*$/u;
const POSTSCRIPT_FONT_NAME = /^[\p{L}\p{M}\p{N}_.,:=+-]*$/u;

/**
 * Line breaks and other control characters. Graphviz writes names and
 * `comment` raw into PostScript `%` comments, where a line break starts
 * code, and copies control characters into JSON and XML output, which
 * cannot hold them (Graphviz 2.43). Tab, LF and CR are allowed in text.
 */
const LINE_BREAK = /[\n\r\f\v]/;
// biome-ignore lint/suspicious/noControlCharactersInRegex: control characters are what this matches
const CONTROL = /[\0-\x08\x0b\x0c\x0e-\x1f\ufffe\uffff]/;

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

/** The rules that depend on the output format. */
interface FormatRules {
  fontName: RegExp;
  spacesInStyle: boolean;
}

/**
 * The characters of Graphviz colors: names, `#rrggbbaa`, `/scheme/name`,
 * HSV with commas and weighted lists (`red:blue;0.3`). `plain` output
 * writes colors as raw fields (Graphviz 2.43).
 */
const COLOR = /^[A-Za-z0-9#/:;.,_+-]*$/;

/**
 * Escapes Graphviz substitutes in values: `\N` node name, `\G` graph name,
 * `\E` edge (`tail->head` with ports), `\T` / `\H` tail and head names,
 * `\L` the object's label. A preceding `\\` is a literal backslash.
 */
const SUBSTITUTION = /(?<!\\)(?:\\\\)*\\[NGETHL]/;
const LABEL_SUBSTITUTION = /(?<!\\)(?:\\\\)*\\L/;

/**
 * Checks every value: control characters at any decoding level, and (for
 * values Graphviz does not decode itself) named references XML does not
 * define, which Graphviz copies into XML output as they are.
 */
function checkCharacters(text: string, at: string, decoded: boolean): void {
  const all = readings(text, true);
  if (all === undefined || all.some((level) => CONTROL.test(level))) {
    throw unsafe(`${at} contains a control character.`);
  }
  if (!decoded && readings(text) === undefined) {
    throw unsafe(
      `${at} contains a character reference other than &amp; &lt; &gt; &quot; &apos; and numeric ones.`,
    );
  }
}

/** Whether a font name, in any reading, is more than a plain name. */
function isUnsafeFontName(value: string, rules: FormatRules): boolean {
  const levels = readings(value);
  return (
    levels === undefined || levels.some((level) => !rules.fontName.test(level))
  );
}

/**
 * What the whole document must be checked for after the walk: Graphviz
 * substitutes names into values, so a name and a value that each pass can
 * form a character reference together (`"&"` and `"\N#1;"`).
 */
interface DocumentState {
  /** A value with a substitution escape and other text. */
  composite?: string;
  /** A name or port containing `&`. */
  ampersandName?: string;
}

/**
 * Checks a value that Graphviz expands escapes in: the literal text must
 * not contain `&` (an expansion could complete a reference), and `\L`,
 * which copies a label Graphviz decodes, only goes into text Graphviz
 * decodes too.
 */
function checkSubstitutions(
  value: string,
  at: string,
  decoded: boolean,
  state: DocumentState,
): void {
  if (!SUBSTITUTION.test(value)) return;
  if (value.includes('&')) {
    throw unsafe(
      `${at} combines a substitution escape such as \\N with "&", which can form a character reference.`,
    );
  }
  if (!decoded && LABEL_SUBSTITUTION.test(value)) {
    throw unsafe(
      `${at} copies the label with \\L into a value Graphviz writes without decoding.`,
    );
  }
  if (!/^(?:\\[NGETHL])$/.test(value)) state.composite ??= at;
}

function checkAttribute(
  attribute: AttributeASTNode,
  rules: FormatRules,
  state: DocumentState,
): void {
  const name = textOf(attribute.key);
  const key = name.toLowerCase();
  const value = textOf(attribute.value);
  const at = `attribute "${name}"${where(attribute)}`;
  const fileProblem = FILE_ATTRIBUTES.get(key);
  if (fileProblem !== undefined) {
    throw unsafe(`${at} ${fileProblem}.`);
  }
  const decoded = TEXT_ATTRIBUTES.has(key) || attribute.value.quoted === 'html';
  checkCharacters(value, at, decoded);
  if (attribute.value.quoted !== 'html') {
    checkSubstitutions(value, at, decoded, state);
  }
  if (URL_ATTRIBUTES.has(key)) {
    const problem = urlProblem(value);
    if (problem !== undefined) throw unsafe(`${at} ${problem}.`);
  }
  if (FONT_ATTRIBUTES.has(key) && isUnsafeFontName(value, rules)) {
    throw unsafe(`${at} is not a plain font name.`);
  }
  if (key === 'comment' && LINE_BREAK.test(value)) {
    throw unsafe(`${at} contains a line break.`);
  }
  // `plain` output writes style, shape and colors as raw space-separated
  // fields, so whitespace or quotes in them add fields (Graphviz 2.43).
  if (key === 'style' && !isKnownStyle(value, rules)) {
    throw unsafe(`${at} is not a list of known styles.`);
  }
  if (key === 'shape' && !/^[A-Za-z0-9_]*$/.test(value)) {
    throw unsafe(`${at} is not a shape name.`);
  }
  if (key.endsWith('color') && !COLOR.test(value)) {
    throw unsafe(
      `${at} is not a color (write HSV colors with commas, e.g. "0.6,0.7,0.7").`,
    );
  }
}

function checkName(
  literal: LiteralASTNode | undefined,
  state: DocumentState,
): void {
  if (literal === undefined) return;
  const text = textOf(literal);
  const at = `name${where(literal)}`;
  if (LINE_BREAK.test(text)) {
    throw unsafe(`${at} contains a line break.`);
  }
  // Names are written into SVG `<title>`s and comments as they are.
  checkCharacters(text, at, false);
  if (text.includes('&')) state.ampersandName ??= at;
}

function checkHtml(
  literal: LiteralASTNode,
  rules: FormatRules,
  state: DocumentState,
): void {
  const at = `HTML-like string${where(literal)}`;
  // Text is decoded and escaped by Graphviz; attribute values only decoded.
  checkCharacters(literal.value, at, true);
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
      const on = `${at}: ${name} on <${tag.name}>`;
      if (key === 'src') {
        throw unsafe(`${on} reads a file.`);
      }
      checkCharacters(value, on, false);
      // Anchor attributes (HREF, TITLE, TARGET, ID) are expanded too.
      checkSubstitutions(value, on, false, state);
      if (key === 'href' || key === 'url') {
        const problem = urlProblem(value);
        if (problem !== undefined) throw unsafe(`${on} ${problem}.`);
      }
      if (key === 'face' && isUnsafeFontName(value, rules)) {
        throw unsafe(`${on} is not a plain font name.`);
      }
      if (key === 'style' && !isKnownStyle(value, rules)) {
        throw unsafe(`${on} is not a list of known styles.`);
      }
      if (key.endsWith('color') && !COLOR.test(value)) {
        throw unsafe(`${on} is not a color.`);
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
function checkSafety(rules: FormatRules) {
  return (ast: DotASTNode): undefined => {
    const state: DocumentState = {};
    for (const node of walk(ast)) {
      switch (node.type) {
        case 'Attribute':
          checkCharacters(
            textOf(node.key),
            `attribute name${where(node)}`,
            false,
          );
          checkAttribute(node, rules, state);
          break;
        case 'Literal':
          if (node.quoted === 'html') checkHtml(node, rules, state);
          break;
        case 'Graph':
        case 'Subgraph':
        case 'Node':
          checkName(node.id, state);
          break;
        case 'NodeRef':
          // `\E` in a value expands to the edge's names and ports.
          checkName(node.id, state);
          checkName(node.port, state);
          break;
      }
    }
    if (state.composite !== undefined && state.ampersandName !== undefined) {
      throw unsafe(
        `${state.composite} puts a substitution escape such as \\N next to other text, and ${state.ampersandName} contains "&": together they can form a character reference.`,
      );
    }
    return undefined;
  };
}

/** The rules of every checked format at once, for a call without a format. */
const STRICTEST_RULES: FormatRules = {
  fontName: POSTSCRIPT_FONT_NAME,
  spacesInStyle: false,
};

function rulesFor(format: string | undefined): FormatRules {
  if (format === undefined) return STRICTEST_RULES;
  const base = format.split(':')[0].toLowerCase();
  if (base === 'ismap') {
    throw unsafe(
      'the "ismap" format writes tooltips and labels raw, one area per line; it cannot be rendered safely.',
    );
  }
  if (!CHECKED_FORMATS.has(base)) {
    throw unsafe(
      `the "${format}" output format has not been checked for untrusted DOT.`,
    );
  }
  return {
    fontName: POSTSCRIPT_FORMATS.has(base)
      ? POSTSCRIPT_FONT_NAME
      : PLAIN_FONT_NAME,
    spacesInStyle: !PLAIN_FORMATS.has(base),
  };
}

/**
 * Check a DOT source from an untrusted party before Graphviz renders it, and
 * return the DOT to render.
 *
 * Graphviz has no sandbox: some attributes make it read local files into
 * its output, URLs are written into SVG and image maps as links, and some
 * values are written raw into PostScript, image maps and `plain` output.
 * `sanitize` parses the source (with the parser limits) and rejects:
 *
 * - `image`, `shapefile`, `imagepath`, `fontpath`, `stylesheet` and the
 *   xdot drawing programs (`_draw_`, …, `_background`);
 * - URL-like attributes (`URL`, `href`, `labelURL`, `HREF` in HTML-like
 *   labels, …) unless they are relative or use `http`, `https` or `mailto`,
 *   and any containing whitespace, control characters, quotes, angle
 *   brackets or backslash escapes;
 * - `<IMG>` and `SRC` in HTML-like strings, and markup it cannot read;
 * - font names (`fontname`, `labelfontname`, `FACE`) other than plain names
 *   (letters, digits and `_ . , : = + -`, and spaces except for PostScript);
 * - `style` values other than known styles and `setlinewidth(n)` (spaces
 *   only outside `plain`), `shape` values other than names, and colors
 *   outside the color syntax;
 * - control characters anywhere, line breaks in names, ports and `comment`,
 *   and named character references other than XML's outside label and
 *   tooltip text;
 * - substitution escapes (`\N`, `\G`, `\E`, `\T`, `\H`, `\L`) that could
 *   assemble a character reference once Graphviz expands them, and `\L`
 *   outside label and tooltip text.
 *
 * Without `options.format` the rules of every checked format apply at
 * once; pass the format to allow what is safe for it (spaces in font names
 * outside PostScript, in styles outside `plain`).
 *
 * Values are checked at every level of character-reference decoding.
 * Attribute names are compared case-insensitively. Layout and size
 * attributes are not checked: bound their cost with the limits of the
 * adapter instead.
 *
 * The returned text is printed from the checked AST, never copied from the
 * input, so Graphviz reads what was checked. Render that text, not the input.
 *
 * @param dot - The DOT source.
 * @param options - Parser limits and the output format.
 * @returns The checked DOT source.
 * @throws `DOMException` named `SecurityError` with `code`
 * `TSG_ERR_UNSAFE_DOT` when the source is unsafe to render, or the format
 * cannot be rendered safely.
 * @throws {@link DotSyntaxError} when the source does not parse.
 * @group Sanitize DOT
 */
export function sanitize(dot: string, options?: SanitizeOptions): string {
  const { format, ...parse } = options ?? {};
  return new Pipeline({ parse })
    .use(checkSafety(rulesFor(format)))
    .process(dot);
}
