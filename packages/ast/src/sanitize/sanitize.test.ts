import { isTsGraphvizError } from '@ts-graphviz/common';
import { describe, expect, it } from 'vitest';
import { sanitize } from './sanitize.js';

function rejection(dot: string): DOMException & { code: string } {
  try {
    sanitize(dot);
  } catch (e) {
    return e as DOMException & { code: string };
  }
  throw new Error(`sanitize accepted ${JSON.stringify(dot)}`);
}

describe('sanitize', { tags: ['SM-7'] }, () => {
  it('returns the source printed from the checked AST', () => {
    expect(
      sanitize('digraph{a->b[label="x" URL="https://example.com/"]}'),
    ).toMatchInlineSnapshot(`
        "digraph {
          a -> b [
            label = "x";
            URL = "https://example.com/";
          ];
        }"
      `);
  });

  it('throws a SecurityError DOMException with a code', () => {
    const error = rejection('graph { a [image="/etc/passwd"] }');
    expect(error).toBeInstanceOf(DOMException);
    expect(error.name).toBe('SecurityError');
    expect(error.code).toBe('TSG_ERR_UNSAFE_DOT');
    expect(isTsGraphvizError(error)).toBe(true);
    expect(error.message).toBe(
      'Unsafe DOT: attribute "image" (line 1, column 12) makes Graphviz read an image file.',
    );
  });

  it('passes on parser errors and limits', () => {
    expect(() => sanitize('graph {')).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_DOT_SYNTAX', limit: undefined }),
    );
    expect(() => sanitize('graph { a; b; c }', { maxASTNodes: 3 })).toThrow(
      expect.objectContaining({
        code: 'TSG_ERR_DOT_SYNTAX',
        limit: 'maxASTNodes',
      }),
    );
  });

  describe('file attributes', () => {
    it.each([
      'a [image="x.png"]',
      'a [shapefile="x.eps" shape=epsf]',
      'imagepath="/var"',
      'fontpath="/usr/share/fonts"',
      'stylesheet="https://example.com/x.css"',
      'graph [stylesheet="x.css"]',
      'node [image="x.png"]',
      'subgraph { edge [IMAGE="x.png"] }',
      'a [ "image" = "x.png" ]',
      'a [ "ima\\\nge" = "x.png" ]',
      'a [ <image> = "x.png" ]',
    ])('rejects %j', (stmt) => {
      expect(rejection(`digraph { ${stmt} }`).code).toBe('TSG_ERR_UNSAFE_DOT');
    });

    it.each([
      'fontname="Helvetica"',
      'a [fontname="DejaVu Sans:style=Bold"]',
      'a [fontname="Times-Roman"]',
      'a [fontname="游ゴシック"]',
      'a [fontname="Noto Sans CJK JP,Bold"]',
    ])('accepts %j for SVG', (stmt) => {
      expect(() =>
        sanitize(`digraph { ${stmt} }`, { format: 'svg' }),
      ).not.toThrow();
    });

    it.each([
      'fontname="/tmp/x.ttf"',
      'a [labelfontname="..\\\\x.ttf"]',
      // Written raw into PostScript output, where it is code (Graphviz 2.43).
      'a [fontname="Helvetica (x) (r) file pop"]',
      'a [fontname="Helvetica\n(x) pop"]',
      'a [fontname="Helvetica %x"]',
    ])('rejects the font name %j', (stmt) => {
      expect(rejection(`digraph { ${stmt} }`).message).toContain(
        'is not a plain font name',
      );
    });

    it.each([
      '_draw_',
      '_ldraw_',
      '_hdraw_',
      '_tdraw_',
      '_hldraw_',
      '_tldraw_',
      '_background',
    ])('rejects the xdot program %s', (key) => {
      expect(
        rejection(`digraph { ${key}="F 14 10 -/tmp/x.ttf T 0 0 0 10 1 -x" }`)
          .message,
      ).toContain('is an xdot drawing program');
    });
  });

  describe('PostScript comments', () => {
    // Graphviz writes these raw into `%` comments (Graphviz 2.43).
    it.each([
      'digraph "g\n(x) pop" { a }',
      'digraph { subgraph "cluster\r(x) pop" { a } }',
      'digraph { "a\n(x) pop" }',
      'digraph { "a\f(x) pop" -> b }',
      'digraph { <a\n(x) pop> }',
      'digraph { comment="c\n(x) pop" }',
      'digraph { a [comment="c\r\n(x) pop"] }',
    ])('rejects a line break in %j', (dot) => {
      expect(rejection(dot).message).toContain('contains a line break');
    });

    it('accepts escaped line breaks and line breaks in labels', () => {
      expect(() =>
        sanitize('digraph { "a\\nb" [label="x\ny" comment="c\\nd"] }'),
      ).not.toThrow();
    });
  });

  describe('URL attributes', () => {
    it.each([
      'https://example.com/',
      'http://example.com/?a=1&amp;b=2',
      'mailto:someone@example.com',
      '#anchor',
      '/relative/path',
      'relative.html',
      '//example.com/x',
      '',
    ])('accepts %j', (url) => {
      expect(() => sanitize(`digraph { a [URL="${url}"] }`)).not.toThrow();
    });

    it.each([
      'javascript:alert(1)',
      'JavaScript:alert(1)',
      ' javascript:alert(1)',
      'java\tscript:alert(1)',
      'java\nscript:alert(1)',
      // A line break adds an image map directive (-Timap, Graphviz 2.43).
      'https://example.com/\ndefault javascript:alert(1)\n#',
      'https://example.com/&#10;default javascript:alert(1)',
      'https://example.com/ x',
      'javascript&#58;alert(1)',
      'javascript&#x3a;alert(1)',
      'javascript&#x3A alert(1)',
      'java&#9;script:alert(1)',
      'javascript&colon;alert(1)',
      'java&Tab;script:alert(1)',
      // More rounds of decoding than are checked.
      `javascript&${'amp;'.repeat(8)}#58;alert(1)`,
      'data:text/html,x',
      'file:///etc/passwd',
      'vbscript:x',
      '\\N',
      '\\G',
    ])('rejects %j', (url) => {
      expect(rejection(`digraph { a [URL="${url}"] }`).code).toBe(
        'TSG_ERR_UNSAFE_DOT',
      );
    });

    it('says when references are nested too deep to check', () => {
      expect(() =>
        sanitize(`digraph { a [URL="&${'amp;'.repeat(8)}#58;"] }`),
      ).toThrow('has character references nested too deep to check');
    });

    it.each([
      'href',
      'edgeURL',
      'edgehref',
      'headURL',
      'headhref',
      'tailURL',
      'tailhref',
      'labelURL',
      'labelhref',
      'url',
    ])('checks %s', (key) => {
      expect(rejection(`digraph { a -> b [${key}="javascript:x"] }`).code).toBe(
        'TSG_ERR_UNSAFE_DOT',
      );
    });
  });

  describe('HTML-like strings', () => {
    it.each([
      '<b>bold</b><br/>text',
      '<table><tr><td href="https://example.com/">x</td></tr></table>',
      '<font face="Helvetica" color="red">x</font>',
      '<!-- <img src="x"/> -->text',
      '<![CDATA[<img src="x"/>]]>',
      'a &lt; b &amp; c',
      '',
    ])('accepts %j', (html) => {
      expect(() => sanitize(`digraph { a [label=<${html}>] }`)).not.toThrow();
    });

    it.each([
      '<img src="x.png"/>',
      '<IMG SRC="x.png"/>',
      '<table><tr><td><IMG SCALE="true" SRC="x.png"/></td></tr></table>',
      '<td src="x">x</td>',
      '<table href="javascript:x"><tr><td>x</td></tr></table>',
      "<td HREF='javascript&#58;x'>x</td>",
      '<td url="data:x">x</td>',
      '<font face="/tmp/x.ttf">x</font>',
      // The XML parser decodes references before Graphviz uses a value, and
      // references it produces are decoded again by the browser (Graphviz 2.43).
      '<table href="&#92;N"><tr><td>x</td></tr></table>',
      '<table href="javascript&amp;#58;x"><tr><td>x</td></tr></table>',
      '<table href="javascript&amp;amp;#58;x"><tr><td>x</td></tr></table>',
      // A named reference the XML parser does not define cannot be checked.
      '<table href="javascript&colon;x"><tr><td>x</td></tr></table>',
      // Not markup as the XML parser reads it: an unquoted attribute value,
      // and a tag that does not end after its attributes.
      '<td href=javascript:x>x</td>',
      '<b !>x</b>',
      '<font face="&#47;tmp&#47;x.ttf">x</font>',
      '<font face="&#x5c;x.ttf">x</font>',
      '<!-- unterminated>',
      '<!DOCTYPE x>',
      '<1>',
    ])('rejects %j', (html) => {
      expect(rejection(`digraph { a [label=<${html}>] }`).code).toBe(
        'TSG_ERR_UNSAFE_DOT',
      );
    });

    it('checks HTML-like strings outside labels too', () => {
      expect(rejection('digraph { <<img src="x"/>> }').code).toBe(
        'TSG_ERR_UNSAFE_DOT',
      );
    });
  });

  it('does not mistake Object.prototype names for checked attributes', () => {
    expect(() =>
      sanitize(
        'digraph { a [constructor="x" __proto__="y" toString="z" URL="&constructor;"] }',
      ),
    ).toThrow(/URL.*character reference/);
    expect(() =>
      sanitize('digraph { a [constructor="x" __proto__="y" toString="z"] }'),
    ).not.toThrow();
  });

  it('does not check layout or cost attributes', () => {
    expect(() =>
      sanitize('digraph { layout=neato size="100,100" dpi=300 maxiter=10 }'),
    ).not.toThrow();
  });

  describe('style, shape and colors', () => {
    it('checks a long style value in linear time', () => {
      // 6 s with the quadratic check; a few milliseconds now. Kept well
      // under the 1 s bound: parsing the source takes most of the time on
      // CI with coverage (1 MB took about 1.1 s there).
      const digits = '1'.repeat(100_000);
      for (const style of [
        `setlinewidth(${digits}`,
        `setlinewidth(${digits}x)`,
      ]) {
        const start = performance.now();
        expect(rejection(`digraph { a [style="${style}"] }`).name).toBe(
          'SecurityError',
        );
        expect(performance.now() - start).toBeLessThan(1000);
      }
    });

    it.each([
      'a [style=filled]',
      'a [style="filled,rounded"]',
      'a [style="dashed, bold"]',
      'a -> b [style="setlinewidth(2)"]',
      'a [style="setlinewidth(.5),filled"]',
      'a [style=""]',
      'a [shape=box]',
      'a [shape=Mrecord]',
      'a [color="red:blue;0.3" fillcolor="#ff000080"]',
      'a [color="0.6,0.7,0.7" fontcolor="/accent3/1"]',
      'a [label=<<table bgcolor="red" style="rounded"><tr><td color="blue">x</td></tr></table>>]',
    ])('accepts %j for SVG', (stmt) => {
      expect(() =>
        sanitize(`digraph { ${stmt} }`, { format: 'svg' }),
      ).not.toThrow();
    });

    it('allows no whitespace in style for plain output, which writes it as one field', () => {
      const dot = 'digraph { a [style="dashed, bold"] }';
      expect(() => sanitize(dot, { format: 'svg' })).not.toThrow();
      for (const format of ['plain', 'plain-ext', undefined]) {
        expect(() => sanitize(dot, { format })).toThrow(
          expect.objectContaining({ code: 'TSG_ERR_UNSAFE_DOT' }),
        );
      }
      expect(() =>
        sanitize('digraph { a [style="dashed,bold"] }', { format: 'plain' }),
      ).not.toThrow();
    });

    it.each([
      'a [color="\\""]',
      'a [fillcolor="red\'"]',
      'a [style="solid\n"]',
    ])('rejects %j, which plain output writes raw', (stmt) => {
      expect(rejection(`digraph { ${stmt} }`).code).toBe('TSG_ERR_UNSAFE_DOT');
    });
  });

  describe('substitution escapes', () => {
    // Graphviz expands \N, \G, \E, \T, \H and \L after reading values, so a
    // name and a value can form text neither contains (Graphviz 2.43).
    it.each([
      ['a [label="\\N &amp;x"]', 'combines a substitution escape'],
      ['"&" [label="\\N#1;"]', 'together they can form'],
      ['"&#x" -> "1;" [label="\\T\\H"]', 'together they can form'],
      ['a [shape=record label="&bogus;" id="\\L"]', 'copies the label'],
      [
        'a [label=<<table title="\\L"><tr><td>x</td></tr></table>>]',
        'copies the label',
      ],
    ])('rejects %j', (stmt, message) => {
      expect(rejection(`digraph { ${stmt} }`).message).toContain(message);
    });

    it.each([
      '"R&D"',
      '"R&D" [id="\\N"]',
      'a [label="\\N\\n(\\G)" tooltip="\\L"]',
      'a -> b [label="\\E" id="\\T-\\H"]',
    ])('accepts %j', (stmt) => {
      expect(() => sanitize(`digraph { ${stmt} }`)).not.toThrow();
    });
  });

  describe('URLs in SVG attributes', () => {
    // Graphviz 2.43 writes href between quotes without escaping it.
    it.each([
      'a [URL="\\""]',
      'a [URL="/x\\"onmouseover=\\"x"]',
      'a [URL="/x\'"]',
      'a [URL="/<x>"]',
      'a [URL="/x&#34;"]',
      'a [label=<<table href="&quot;"><tr><td>x</td></tr></table>>]',
    ])('rejects %j', (stmt) => {
      expect(rejection(`digraph { ${stmt} }`).code).toBe('TSG_ERR_UNSAFE_DOT');
    });

    it.each([
      'a [style="quit"]',
      'a [style="dashed(quit)"]',
      'a [style="setlinewidth(quit)"]',
      'a [style="filled quit"]',
      'a [shape="box x"]',
      'a [color="red blue"]',
      'a [fillcolor="0.6 0.7 0.7"]',
      'a [color="red\nstop"]',
      'a [label=<<table style="quit"><tr><td>x</td></tr></table>>]',
      'a [label=<<table><tr><td bgcolor="red x">x</td></tr></table>>]',
    ])('rejects %j', (stmt) => {
      expect(rejection(`digraph { ${stmt} }`).code).toBe('TSG_ERR_UNSAFE_DOT');
    });
  });

  describe('characters JSON and XML output cannot hold', () => {
    const c1 = String.fromCharCode(1);
    it.each([
      `a [x="${c1}"]`,
      `a [tooltip="t${c1}"]`,
      `"n${c1}"`,
      `a ["k${c1}"=x]`,
      'a [label="l&#1;"]',
      'a [label="l&amp;#x1f;"]',
      'a [label=<x&#1;>]',
      'a [label=<<table title="&#2;"><tr><td>x</td></tr></table>>]',
    ])('rejects a control character in %j', (stmt) => {
      expect(rejection(`digraph { ${stmt} }`).message).toContain(
        'control character',
      );
    });

    it.each([
      'a [URL="/" target="&bogus;"]',
      'a [id="&nbsp;"]',
      '"n &bogus;"',
      'a [label=<<table target="&amp;bogus;"><tr><td>x</td></tr></table>>]',
    ])('rejects a named reference Graphviz copies as written in %j', (stmt) => {
      expect(rejection(`digraph { ${stmt} }`).message).toContain(
        'character reference other than',
      );
    });

    it('accepts named references in label and tooltip text, which Graphviz decodes', () => {
      expect(() =>
        sanitize(
          'digraph { a [label="&nbsp;&eacute;&bogus;" tooltip="&nbsp;" URL="/"]; b [label=<&nbsp;&eacute;>] }',
        ),
      ).not.toThrow();
    });

    it('rejects a line break in a port, which \\E writes', () => {
      expect(rejection('digraph { a:"p\nq" -> b }').message).toContain(
        'line break',
      );
    });
  });

  describe('output formats', () => {
    function formatRejection(format: string): DOMException & { code: string } {
      try {
        sanitize('digraph { a }', { format });
      } catch (e) {
        return e as DOMException & { code: string };
      }
      throw new Error(`sanitize accepted the format ${format}`);
    }

    it.each(['svg', 'png', 'png:cairo', 'pdf', 'json', 'plain', 'cmapx', 'PS'])(
      'accepts %s',
      (format) => {
        expect(() => sanitize('digraph { a }', { format })).not.toThrow();
      },
    );

    it('rejects ismap, which writes labels raw one area per line', () => {
      expect(formatRejection('ismap').message).toContain('"ismap"');
    });

    it.each(['vml', 'fig', 'pic', 'x11', 'cmap'])(
      'rejects the unchecked %s',
      (format) => {
        expect(formatRejection(format).message).toContain(
          'has not been checked',
        );
      },
    );

    it('requires single-token font names for PostScript, where spaces separate code', () => {
      const dot = 'digraph { a [fontname="Times New Roman"] }';
      expect(() => sanitize(dot, { format: 'svg' })).not.toThrow();
      // Without a format, the rules of every checked format apply.
      expect(() => sanitize(dot)).toThrow(
        expect.objectContaining({ code: 'TSG_ERR_UNSAFE_DOT' }),
      );
      for (const format of ['ps', 'ps2', 'eps', 'ps:cairo']) {
        expect(() => sanitize(dot, { format })).toThrow(
          expect.objectContaining({ code: 'TSG_ERR_UNSAFE_DOT' }),
        );
      }
      expect(() =>
        sanitize('digraph { a [fontname="Times-Roman"] }', { format: 'ps' }),
      ).not.toThrow();
    });
  });
});
