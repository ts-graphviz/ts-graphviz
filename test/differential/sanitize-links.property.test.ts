/**
 * `sanitize` against the Graphviz `dot` binary (#1681): every link in the
 * SVG that Graphviz writes for DOT that `sanitize` accepted must be one a
 * browser reads as relative or `http`, `https` or `mailto`.
 *
 * Link values are built from pieces that each fooled a check at some point
 * (scheme spellings, character references at one and two levels, `\N`,
 * whitespace) and placed in a `URL` attribute or an HTML-like `HREF`. The
 * oracle is Graphviz's own output, decoded as a browser decodes it, not the
 * rules of `sanitize`.
 *
 * Skipped when `dot` is not installed. `FC_NUM_RUNS` raises the run count.
 */
import { spawnSync } from 'node:child_process';
import fc from 'fast-check';
import { sanitize } from 'ts-graphviz/ast';
import { beforeEach, describe, expect, it } from 'vitest';

let dotInstalled: boolean | undefined;
/** Whether `dot` runs, asked by the first test that needs it. */
const hasDot = () =>
  (dotInstalled ??= spawnSync('dot', ['-V'], { timeout: 10_000 }).status === 0);

const piece = fc.constantFrom(
  'javascript',
  'JaVaScRiPt',
  'data',
  'https',
  'http',
  'mailto',
  ':',
  '&#58;',
  '&#x3a;',
  '&amp;#58;',
  '&amp;amp;#58;',
  '&amp;',
  '\\N',
  '\\G',
  '&#92;N',
  '&#92;&#78;',
  '\t',
  ' ',
  '&#9;',
  '&#10;',
  '/',
  '//',
  'x',
  '%3a',
  '#',
  '?',
  'alert(1)',
  '\\"',
  '&quot;',
  '&#34;',
  "'",
  '<',
  ' onmouseover=x ',
);

const link = fc
  .array(piece, { minLength: 1, maxLength: 6 })
  .map((p) => p.join(''));

const name = fc.constantFrom(
  'a',
  'javascript:alert(1)',
  'data:x,y',
  'https://ok',
);

/** A DOT source with one link, in a `URL` attribute or an HTML-like `HREF`. */
const source = fc
  .tuple(name, link, fc.boolean())
  .map(([id, url, html]) =>
    html
      ? `digraph { "${id}" [label=<<TABLE HREF="${url}"><TR><TD>x</TD></TR></TABLE>>] }`
      : `digraph { "${id}" [URL="${url}"] }`,
  );

const XML_REFERENCES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

/** The URL a browser follows for an SVG attribute value. */
function browserUrl(attribute: string): string | undefined {
  let unknownReference = false;
  const decoded = attribute.replace(
    /&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|(\w+));/g,
    (_, dec?: string, hex?: string, named?: string) => {
      if (named !== undefined) {
        if (!Object.hasOwn(XML_REFERENCES, named)) unknownReference = true;
        return XML_REFERENCES[named] ?? '';
      }
      return String.fromCodePoint(
        Number.parseInt(dec ?? `${hex}`, dec ? 10 : 16),
      );
    },
  );
  // A browser's URL parser drops tabs and newlines, and leading controls
  // and spaces.
  return unknownReference
    ? undefined
    : decoded.replace(/[\t\n\r]/g, '').replace(/^[\0-\x20]+/, '');
}

/** Every `href` / `xlink:href` value in the SVG. */
function svgLinks(svg: string): string[] {
  return [...svg.matchAll(/[\s:]href="([^"]*)"/g)].map((m) => m[1]);
}

describe('sanitize and the links Graphviz writes', {
  tags: ['SM-7', 'process'],
}, () => {
  beforeEach(({ skip }) => skip(!hasDot(), 'dot is not installed'));
  // Each case runs dot; FC_NUM_RUNS (the nightly run) makes it long.
  it.each(['default', 'strict'] as const)(
    'every link in the SVG of DOT accepted by the %s policy is relative, http, https or mailto',
    { timeout: 25 * 60_000 },
    (policy) => {
      let accepted = 0;
      let links = 0;
      const runs = Number(process.env.FC_NUM_RUNS ?? 300);
      for (const dot of fc.sample(source, runs)) {
        let checked: string;
        try {
          checked = sanitize(dot, { policy });
        } catch (e) {
          // Unsafe, or (a raw `<` in an HTML-like string) not DOT at all.
          expect(['TSG_ERR_UNSAFE_DOT', 'TSG_ERR_DOT_SYNTAX']).toContain(
            (e as { code?: unknown }).code,
          );
          continue;
        }
        accepted++;
        const r = spawnSync('dot', ['-Tsvg'], {
          input: checked,
          encoding: 'utf8',
          timeout: 30_000,
        });
        expect(r.status, `${checked}\n${r.stderr}`).toBe(0);
        // Every anchor is made of well-formed attributes only: a quote in a
        // link would end its attribute and start others.
        for (const [anchor] of r.stdout.matchAll(/<a\b[^>]*>/g)) {
          expect(anchor, checked).toMatch(/^<a(?:\s+[\w:-]+="[^"<]*")*\s*>$/);
        }
        for (const href of svgLinks(r.stdout)) {
          links++;
          const url = browserUrl(href);
          expect(url, `${checked}\nwrote href="${href}"`).toBeDefined();
          const scheme = /^([A-Za-z][A-Za-z0-9+.-]*):/.exec(`${url}`)?.[1];
          if (scheme !== undefined) {
            expect(
              ['http', 'https', 'mailto'],
              `${checked}\nwrote href="${href}"`,
            ).toContain(scheme.toLowerCase());
          }
        }
      }
      // The generator must reach the accepting side often enough to mean something.
      expect(accepted).toBeGreaterThan(runs / 10);
      expect(links).toBeGreaterThan(runs / 10);
    },
  );
});
