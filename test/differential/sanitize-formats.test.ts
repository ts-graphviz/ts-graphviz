/**
 * `sanitize` against the Graphviz `dot` binary (#1681): a source full of
 * values that pass the checks but are awkward for some format (quotes,
 * parentheses, `%`, references, escapes, records, HTML-like labels) renders
 * to every format `sanitize` accepts, and each output holds together as its
 * format requires — JSON parses, DOT reads back, `plain` and image maps
 * contain only their own records, PostScript font settings are one token.
 *
 * Skipped when `dot` is not installed.
 */
import { spawnSync } from 'node:child_process';
import { sanitize } from 'ts-graphviz/ast';
import { describe, expect, it } from 'vitest';

const hasDot = spawnSync('dot', ['-V']).status === 0;

const source = String.raw`digraph "G \"<b>(p)%" {
  label="L &nbsp;&eacute; \"<b>(p)% \n x"
  subgraph "cluster C(p)%" { label="C\l" "n \"(p)%&amp;" }
  "n \"(p)%&amp;" -> b [label="e(p)" tooltip="t \N" URL="https://x/?a=1&amp;b=(2)" target="_blank" id="i(p)" class="c(p)" style="setlinewidth(2),dashed" color="red:blue" fontname="Times-Roman"]
  b [shape=record label="<f0> a\"(p)|{<f1> b}" fillcolor="#ff0000" style=filled]
  c [label=<<table href="/x" title="t(p)"><tr><td>H &amp;(p)</td></tr></table>>]
}`;

const formats = [
  'svg',
  'svgz',
  'png',
  'jpg',
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
];

function check(format: string, output: Buffer): void {
  const text = output.toString('utf8');
  const lines = text.split('\n').filter(Boolean);
  if (format.includes('json')) {
    expect(() => JSON.parse(text)).not.toThrow();
  } else if (['dot', 'gv', 'canon', 'xdot'].includes(format)) {
    expect(spawnSync('dot', ['-Tcanon'], { input: output }).status).toBe(0);
  } else if (format.startsWith('plain')) {
    for (const line of lines) expect(line).toMatch(/^(graph|node|edge|stop)\b/);
  } else if (format.startsWith('imap')) {
    for (const line of lines) {
      expect(line).toMatch(/^(base|default|rect|circle|poly|point) /);
    }
  } else if (['ps', 'ps2', 'eps'].includes(format)) {
    const fonts = lines.filter(
      (l) => l.endsWith('set_font') && /^[\d.]+ \//.test(l),
    );
    expect(fonts.length).toBeGreaterThan(0);
    for (const line of fonts) expect(line).toMatch(/^[\d.]+ \/\S+ set_font$/);
  }
}

describe.skipIf(!hasDot)('[SM-7] sanitize and the output formats', () => {
  it.each(formats)(
    'accepted DOT renders to %s and holds together',
    (format) => {
      const checked = sanitize(source, { format });
      const r = spawnSync('dot', [`-T${format}`], {
        input: checked,
        maxBuffer: 64 * 1024 * 1024,
      });
      expect(r.status, r.stderr.toString()).toBe(0);
      check(format, r.stdout);
    },
  );
});
