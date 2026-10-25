/** A start or end tag of HTML-like markup. */
export interface Tag {
  /** The tag name as written. */
  name: string;
  /** The attributes as written, values with character references intact. */
  attributes: [name: string, value: string][];
}

const NAME = /[A-Za-z_:][\w.:-]*/y;
const ATTRIBUTE = /\s+([A-Za-z_:][\w.:-]*)\s*=\s*(?:"([^"<]*)"|'([^'<]*)')/y;
const TAG_END = /\s*\/?>/y;
const SKIPPED: [start: string, end: string][] = [
  ['<!--', '-->'],
  ['<![CDATA[', ']]>'],
  ['<?', '?>'],
];

/**
 * The tags of HTML-like markup (the text between the outer `<` and `>` of
 * an HTML string), read as the XML parser of Graphviz reads them; comments,
 * CDATA sections and processing instructions are skipped.
 *
 * Returns `undefined` when the markup cannot be read that way: anything the
 * reader here does not understand is treated as unsafe, not ignored.
 */
export function readTags(markup: string): Tag[] | undefined {
  const tags: Tag[] = [];
  let i = markup.indexOf('<');
  outer: while (i !== -1) {
    for (const [start, end] of SKIPPED) {
      if (markup.startsWith(start, i)) {
        const close = markup.indexOf(end, i + start.length);
        if (close === -1) return undefined;
        i = markup.indexOf('<', close + end.length);
        continue outer;
      }
    }
    NAME.lastIndex = markup[i + 1] === '/' ? i + 2 : i + 1;
    const name = NAME.exec(markup)?.[0];
    if (name === undefined) return undefined;
    const tag: Tag = { name, attributes: [] };
    let j = NAME.lastIndex;
    for (;;) {
      ATTRIBUTE.lastIndex = j;
      const attribute = ATTRIBUTE.exec(markup);
      if (!attribute) break;
      tag.attributes.push([attribute[1], attribute[2] ?? attribute[3] ?? '']);
      j = ATTRIBUTE.lastIndex;
    }
    TAG_END.lastIndex = j;
    if (!TAG_END.test(markup)) return undefined;
    tags.push(tag);
    i = markup.indexOf('<', TAG_END.lastIndex);
  }
  return tags;
}
