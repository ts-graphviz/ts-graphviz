import fc from 'fast-check';
import { createElement, type ReactElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { renderHTMLLike } from './renderHTMLLike.js';

// Tests compare the markup form; renderHTMLLike itself returns an HTMLLikeValue.
const html = (...args: Parameters<typeof renderHTMLLike>) =>
  `<${renderHTMLLike(...args).value}>`;

/** `<dot:b>` nested `levels` times around `leaf`. */
function nested(levels: number, leaf: ReactNode = 'content'): ReactElement {
  let element = <dot:b>{leaf}</dot:b>;
  for (let i = 0; i < levels; i++) {
    element = <dot:b>{element}</dot:b>;
  }
  return element;
}

/** Decodes the entities renderHTMLLike writes. */
const unescape = (text: string) =>
  text
    .replaceAll('&quot;', '"')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');

describe('renderHTMLLike()', { tags: ['SM-3'] }, () => {
  it('returns "<>" for undefined label', () => {
    expect(html()).toBe('<>');
  });

  it('returns "<>" for null label', () => {
    expect(html(null as any)).toBe('<>');
  });

  it('handles dot:table transformation', () => {
    const element = (
      <dot:table border={0} cellborder={1}>
        <dot:tr>
          <dot:td>Cell1</dot:td>
          <dot:td>Cell2</dot:td>
        </dot:tr>
      </dot:table>
    );
    expect(html(element)).toBe(
      '<<table border="0" cellborder="1"><tr><td>Cell1</td><td>Cell2</td></tr></table>>',
    );
  });

  it('handles closing tags with dot: prefix', () => {
    const element = (
      <dot:font color="red">
        <dot:b>Bold text</dot:b>
      </dot:font>
    );
    expect(html(element)).toBe('<<font color="red"><b>Bold text</b></font>>');
  });

  it('handles empty elements', () => {
    expect(html(<dot:br />)).toBe('<<br></br>>');
  });

  it('preserves attributes on transformed elements', () => {
    const element = (
      <dot:table border={1} cellspacing={0} cellpadding="4">
        Content
      </dot:table>
    );
    expect(html(element)).toBe(
      '<<table border="1" cellspacing="0" cellpadding="4">Content</table>>',
    );
  });

  it('sets a port with the port attribute', () => {
    const element = (
      <dot:table port="t">
        <dot:tr>
          <dot:td port="p1">a</dot:td>
        </dot:tr>
      </dot:table>
    );
    expect(html(element)).toBe(
      '<<table port="t"><tr><td port="p1">a</td></tr></table>>',
    );
  });

  it('renders fragments and components by their content', () => {
    const Cell = ({ text }: { text: string }) => <dot:td>{text}</dot:td>;
    const element = (
      <dot:tr>
        {/* biome-ignore lint/complexity/noUselessFragments: the fragment is what is tested */}
        <>
          <Cell text="a" />
          <Cell text="b" />
        </>
      </dot:tr>
    );
    expect(html(element)).toBe('<<tr><td>a</td><td>b</td></tr>>');
  });

  it('writes a true attribute bare and leaves out false and null', () => {
    const element = createElement('dot:td', {
      fixedsize: true,
      href: null,
      title: false,
    } as any);
    expect(html(element)).toBe('<<td fixedsize></td>>');
  });

  describe('escaping (#1745)', () => {
    it('writes text children as text', () => {
      expect(html(<dot:td>{'<b>hi</b> & </td>'}</dot:td>)).toBe(
        '<<td>&lt;b&gt;hi&lt;/b&gt; &amp; &lt;/td&gt;</td>>',
      );
    });

    it('keeps JSX entities as text', () => {
      expect(html(<dot:td>Content with &lt; and &gt;</dot:td>)).toBe(
        '<<td>Content with &lt; and &gt;</td>>',
      );
    });

    it('writes attribute values so that they cannot end the value', () => {
      expect(html(<dot:table title={'x" href="https://evil.example/'} />)).toBe(
        '<<table title="x&quot; href=&quot;https://evil.example/"></table>>',
      );
    });

    it('any string is text, as a child or as an attribute value', () => {
      fc.assert(
        fc.property(fc.string(), fc.string(), (title, text) => {
          const markup = renderHTMLLike(
            <dot:td title={title}>{text}</dot:td>,
          ).value;
          // The structure is the element and nothing else; the strings come
          // back unchanged from the value and the content.
          const match = /^<td title="([^"<>]*)">([^<>]*)<\/td>$/.exec(markup);
          expect(match).not.toBeNull();
          expect(unescape(match?.[1] ?? '')).toBe(title);
          expect(unescape(match?.[2] ?? '')).toBe(text);
        }),
      );
    });
  });

  describe('elements and attributes HTML-like labels do not have', () => {
    it('rejects an element that is not one of HTML-like labels', () => {
      expect(() => html(createElement('div', null, 'x'))).toThrow(TypeError);
      expect(() =>
        html(createElement('script', null, 'alert(1)') as ReactElement),
      ).toThrow('<script> is not an element of HTML-like labels.');
    });

    it('rejects dot:port, pointing at the port attribute', () => {
      expect(() => html(createElement('dot:port', null, 'p'))).toThrow(
        /port attribute of <dot:table> or <dot:td>/,
      );
    });

    it('rejects an attribute name that is not a name', () => {
      expect(() =>
        html(createElement('dot:td', { 'x onclick': 'y' } as any)),
      ).toThrow(TypeError);
      expect(() =>
        html(createElement('dot:td', { 'a="b"': '' } as any)),
      ).toThrow(TypeError);
    });

    it('lets a component error through', () => {
      const Broken = (): ReactElement => {
        throw new Error('broken');
      };
      expect(() =>
        html(
          <dot:td>
            <Broken />
          </dot:td>,
        ),
      ).toThrow('broken');
    });
  });

  // Test for potential ReDoS protection
  it('handles pathological input efficiently', () => {
    const problematicContent = 'a'.repeat(1000);
    const element = (
      <dot:table>
        <dot:tr>
          <dot:td>{problematicContent}</dot:td>
        </dot:tr>
      </dot:table>
    );

    const start = Date.now();
    const result = html(element);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);
    expect(result).toContain(problematicContent);
  });

  // Security tests: Stack overflow prevention
  describe('security: stack overflow prevention', () => {
    it('throws on deeply nested structures (>1000 levels)', () => {
      expect(() => html(nested(1001))).toThrow(RangeError);
      expect(() => html(nested(1001))).toThrow(
        'Maximum rendering depth of 1000 exceeded',
      );
    });

    it('allows custom maxDepth option to handle deeper nesting', () => {
      const element = nested(1500);
      expect(() => html(element)).toThrow(RangeError);
      expect(html(element, { maxDepth: 2000 })).toContain('<b>content</b>');
    });

    it('allows custom maxDepth option for stricter limits', () => {
      const element = nested(150);
      expect(html(element)).toContain('<b>content</b>');
      expect(() => html(element, { maxDepth: 100 })).toThrow(RangeError);
    });

    it('sanitizes invalid maxDepth values', () => {
      const element = nested(50);
      // Infinity, NaN, negative values and zero fall back to the default
      for (const maxDepth of [Number.POSITIVE_INFINITY, Number.NaN, -100, 0]) {
        expect(html(element, { maxDepth })).toContain('content');
      }
      // Decimal values are floored
      expect(html(element, { maxDepth: 75.9 })).toContain('content');
      expect(() => html(element, { maxDepth: 49.9 })).toThrow(RangeError);
    });

    it('handles structures just under the limit (1000 levels)', () => {
      expect(html(nested(999))).toContain('<b>content</b>');
    });
  });

  // Security tests: Circular reference prevention
  describe('security: circular reference prevention', () => {
    it('allows reusing the same ReactElement instance multiple times', () => {
      const sharedElement = <dot:i>Shared Text</dot:i>;
      const result = html(
        <dot:td>
          {sharedElement}
          {sharedElement}
        </dot:td>,
      );
      expect(result.match(/Shared Text/g)).toHaveLength(2);
    });

    it('detects circular element references', () => {
      // An element whose children array is changed to hold the element.
      const children: ReactNode[] = [];
      const element = createElement('dot:b', null, children);
      children.push(element);
      expect(() => html(element)).toThrow(TypeError);
      expect(() => html(element)).toThrow('Circular reference detected');
    });

    it('handles deeply nested arrays without false positive circular detection', () => {
      const element = (
        <dot:table>
          {[1, 2, 3].map((i) => (
            <dot:tr key={i}>
              {[4, 5, 6].map((j) => (
                <dot:td key={j}>
                  Item {i}-{j}
                </dot:td>
              ))}
            </dot:tr>
          ))}
        </dot:table>
      );
      expect(html(element).match(/Item/g)).toHaveLength(9);
    });
  });

  describe('children', () => {
    it('renders only React elements as elements, not objects shaped like them', () => {
      const lookalike = { type: 'dot:b', props: { children: 'text' } };
      expect(() =>
        html(<dot:td>{lookalike as unknown as ReactNode}</dot:td>),
      ).toThrow(
        new TypeError(
          'Only elements, strings, numbers, booleans, null and arrays of them can be children of an HTML-like label.',
        ),
      );
    });

    it('counts nested arrays toward maxDepth', () => {
      let children: ReactNode = 'leaf';
      for (let i = 0; i < 20; i++) children = [children];
      expect(() => html(<dot:td>{children}</dot:td>, { maxDepth: 10 })).toThrow(
        RangeError,
      );
      expect(html(<dot:td>{children}</dot:td>, { maxDepth: 30 })).toBe(
        '<<td>leaf</td>>',
      );
    });

    it('rejects an array that contains itself', () => {
      const children: unknown[] = ['a'];
      children.push(children);
      expect(() => html(<dot:td>{children as ReactNode}</dot:td>)).toThrow(
        TypeError,
      );
    });
  });

  // Performance test with security constraints
  it('completes rendering within reasonable time even with complex structures', () => {
    let element: ReactElement = <dot:b>leaf</dot:b>;
    for (let i = 0; i < 500; i++) {
      element = (
        <dot:b>
          {element}
          <dot:i>sibling-{i}</dot:i>
        </dot:b>
      );
    }

    const start = Date.now();
    html(element);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000);
  });
});
