const ALLOWED_SCHEMES = ['http', 'https', 'mailto'];

/** The named character references of XML. */
const XML_NAMED_REFERENCES = new Map([
  ['amp', '&'],
  ['lt', '<'],
  ['gt', '>'],
  ['quot', '"'],
  ['apos', "'"],
]);

/** More rounds of decoding than any reader between the DOT and a browser does. */
const MAX_DECODING_ROUNDS = 8;

/**
 * Decode one level of character references. A named reference other than
 * the XML ones (such as `&colon;` or `&Tab;`) cannot be checked without the
 * HTML entity table, so it gives `undefined`, or is kept as written with
 * `keepUnknown`.
 */
function decodeOnce(text: string, keepUnknown: boolean): string | undefined {
  let unknown = false;
  const decoded = text.replace(
    /&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|([A-Za-z][A-Za-z0-9]*));?/g,
    (match, dec?: string, hex?: string, name?: string) => {
      if (dec !== undefined || hex !== undefined) {
        const codePoint = Number.parseInt(dec ?? `${hex}`, dec ? 10 : 16);
        return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : '';
      }
      if (!match.endsWith(';')) return match;
      const char = XML_NAMED_REFERENCES.get(`${name}`);
      if (char === undefined) unknown = true;
      return char ?? match;
    },
  );
  return unknown && !keepUnknown ? undefined : decoded;
}

/**
 * Every reading of a value, from as written to fully decoded. A value in an
 * HTML-like label is decoded once by Graphviz's XML parser, which writes
 * references it produced (`&amp;#58;` → `&#58;`) into SVG for the browser to
 * decode again; checking every level covers every such chain.
 *
 * Returns `undefined` when decoding does not settle, or when a level has a
 * named reference other than the XML ones, unless `keepUnknown` is set.
 */
export function readings(
  value: string,
  keepUnknown = false,
): string[] | undefined {
  const levels = [value];
  for (let round = 0; round < MAX_DECODING_ROUNDS; round++) {
    const current = levels[levels.length - 1];
    const next = decodeOnce(current, keepUnknown);
    if (next === undefined) return undefined;
    if (next === current) return levels;
    levels.push(next);
  }
  return undefined;
}

/**
 * Why a URL-like value is unsafe to put into Graphviz output, or `undefined`
 * when every reading of it is a relative URL or uses `http`, `https` or
 * `mailto`.
 *
 * @param value - The value as Graphviz reads it.
 */
export function urlProblem(value: string): string | undefined {
  const levels = readings(value);
  if (levels === undefined) {
    return 'contains a character reference that cannot be checked';
  }
  for (const level of levels) {
    if (level.includes('\\')) {
      // e.g. `\N` becomes the node name, which can be anything.
      return 'contains a backslash escape, which Graphviz expands';
    }
    // Image maps (-Timap, -Tismap) are lines of space-separated fields with
    // the URL written raw, so whitespace adds fields and a line break adds
    // directives (Graphviz 2.43). A browser's URL parser also drops tabs and
    // newlines, which would hide a scheme (`java\tscript:`).
    if (/[\0-\x20\x7f]/.test(level)) {
      return 'contains whitespace or a control character';
    }
    const scheme = /^([A-Za-z][A-Za-z0-9+.-]*):/.exec(level)?.[1];
    if (
      scheme !== undefined &&
      !ALLOWED_SCHEMES.includes(scheme.toLowerCase())
    ) {
      return `uses the "${scheme}:" scheme`;
    }
  }
  return undefined;
}
