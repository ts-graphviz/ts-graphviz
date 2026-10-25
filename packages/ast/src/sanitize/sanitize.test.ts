import { isTsGraphvizError } from '@ts-graphviz/common';
import { describe, expect, it } from 'vitest';
import { DotSyntaxError } from '../dot-shim/parser/parse.js';
import { sanitize } from './sanitize.js';

function rejection(dot: string): DOMException & { code: string } {
  try {
    sanitize(dot);
  } catch (e) {
    return e as DOMException & { code: string };
  }
  throw new Error(`sanitize accepted ${JSON.stringify(dot)}`);
}

describe('[SM-7] sanitize', () => {
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
    expect(() => sanitize('graph {')).toThrow(DotSyntaxError);
    expect(() => sanitize('graph { a; b; c }', { maxASTNodes: 3 })).toThrow(
      DotSyntaxError,
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

    it.each(['fontname="Helvetica"', 'a [fontname="DejaVu Sans:bold"]'])(
      'accepts %j',
      (stmt) => {
        expect(() => sanitize(`digraph { ${stmt} }`)).not.toThrow();
      },
    );

    it.each(['fontname="/tmp/x.ttf"', 'a [labelfontname="..\\\\x.ttf"]'])(
      'rejects the font path %j',
      (stmt) => {
        expect(rejection(`digraph { ${stmt} }`).message).toContain(
          'names a font file',
        );
      },
    );
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
      'javascript&#58;alert(1)',
      'javascript&#x3a;alert(1)',
      'javascript&#x3A alert(1)',
      'java&#9;script:alert(1)',
      'javascript&colon;alert(1)',
      'java&Tab;script:alert(1)',
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

  it('does not check layout or cost attributes', () => {
    expect(() =>
      sanitize('digraph { layout=neato size="100,100" dpi=300 maxiter=10 }'),
    ).not.toThrow();
  });
});
