const ALLOWED_SCHEMES = ['http', 'https', 'mailto'];

/** The character references an XML or HTML reader may decode in a URL. */
const SAFE_NAMED_REFERENCES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

/**
 * Decode character references as a browser reading Graphviz's SVG would:
 * Graphviz keeps `&…;` sequences when it writes a URL. A named reference
 * other than the XML ones (such as `&colon;` or `&Tab;`) cannot be checked
 * without the HTML entity table, so it makes the URL unsafe.
 */
function decodeReferences(text: string): string | undefined {
  let unknown = false;
  const decoded = text.replace(
    /&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|([A-Za-z][A-Za-z0-9]*));?/g,
    (match, dec?: string, hex?: string, name?: string) => {
      if (dec !== undefined || hex !== undefined) {
        const codePoint = Number.parseInt(dec ?? `${hex}`, dec ? 10 : 16);
        return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : '';
      }
      if (!match.endsWith(';')) return match;
      const char = SAFE_NAMED_REFERENCES[`${name}`];
      if (char === undefined) unknown = true;
      return char ?? match;
    },
  );
  return unknown ? undefined : decoded;
}

/**
 * Why a URL-like value is unsafe to put into Graphviz output, or `undefined`
 * when it is a relative URL or uses `http`, `https` or `mailto`.
 *
 * @param value - The value as Graphviz reads it.
 */
export function urlProblem(value: string): string | undefined {
  if (value.includes('\\')) {
    // e.g. `\N` becomes the node name, which can be anything.
    return 'contains a backslash escape, which Graphviz expands';
  }
  const decoded = decodeReferences(value);
  if (decoded === undefined) {
    return 'contains a character reference that cannot be checked';
  }
  // A URL parser drops tabs and newlines anywhere and leading controls and
  // spaces, so `java\tscript:` is a `javascript:` URL.
  const url = decoded.replace(/[\t\n\r]/g, '').replace(/^[\0-\x20]+/, '');
  const scheme = /^([A-Za-z][A-Za-z0-9+.-]*):/.exec(url)?.[1];
  if (scheme !== undefined && !ALLOWED_SCHEMES.includes(scheme.toLowerCase())) {
    return `uses the "${scheme}:" scheme`;
  }
  return undefined;
}
