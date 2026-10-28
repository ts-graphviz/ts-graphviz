import { type HTMLLikeValue, htmlLike, isHTMLLike } from '@ts-graphviz/common';
import { Digraph } from '@ts-graphviz/core';
import { describe, expect, it } from 'vitest';
import { toDot } from './to-dot.js';

/**
 * An HTML-like value branded as another copy of `@ts-graphviz/common`
 * brands it (the key is a registered symbol, shared by every copy), without
 * the checks `htmlLike()` makes: the printer is then the only check left.
 */
function brandedElsewhere(markup: string): HTMLLikeValue {
  return Object.freeze(brandedUnfrozen(markup));
}

/** The same, not frozen, so a proxy over it may answer as it likes. */
function brandedUnfrozen(markup: string): HTMLLikeValue {
  const value = { $$kind: 'html', value: markup } as const;
  Object.defineProperty(value, Symbol.for('@ts-graphviz/common/value-kind'), {
    value: 'html',
  });
  return value;
}

function write(label: HTMLLikeValue): string {
  const g = new Digraph();
  g.createNode('a', { label });
  return toDot(g);
}

describe('an HTML-like value is checked again when written', {
  tags: ['SM-3'],
}, () => {
  it('writes a branded value with balanced markup', () => {
    const value = brandedElsewhere('<b>bold</b>');
    expect(isHTMLLike(value)).toBe(true);
    expect(write(value)).toBe(write(htmlLike('<b>bold</b>')));
  });

  it.each([
    ['an extra ">"', 'x>] b [shape=box'],
    ['an unclosed "<"', '<b'],
    ['a ">" before its "<"', '><'],
  ])('rejects markup with %s (TSG_ERR_INVALID_HTML_LIKE)', (_, markup) => {
    expect(() => htmlLike(markup)).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_INVALID_HTML_LIKE' }),
    );
    const value = brandedElsewhere(markup);
    expect(isHTMLLike(value)).toBe(true);
    expect(() => write(value)).toThrow(
      expect.objectContaining({
        name: 'RangeError',
        code: 'TSG_ERR_INVALID_HTML_LIKE',
      }),
    );
  });

  it('rejects markup with a NUL (TSG_ERR_NUL_CHARACTER)', () => {
    expect(() => htmlLike('a\0b')).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_INVALID_HTML_LIKE' }),
    );
    expect(() => write(brandedElsewhere('a\0b'))).toThrow(
      expect.objectContaining({
        name: 'RangeError',
        code: 'TSG_ERR_NUL_CHARACTER',
      }),
    );
  });

  it('writes the markup it checked, read once', () => {
    // A value that answers differently each time its markup is read.
    let reads = 0;
    const value = brandedUnfrozen('<b>ok</b>');
    const changing = new Proxy(value, {
      get(target, key, receiver) {
        if (key !== 'value') return Reflect.get(target, key, receiver);
        reads++;
        return reads === 1 ? '<b>ok</b>' : 'x>] b [shape=box';
      },
    });
    expect(isHTMLLike(changing)).toBe(true);
    reads = 0;
    const dot = write(changing);
    expect(reads).toBe(1);
    expect(dot).toBe(write(htmlLike('<b>ok</b>')));
  });

  it('does not take a getter for the markup', () => {
    // isHTMLLike promises a string `value`, which an accessor does not
    // establish: a value with one is not HTML-like, and is written as any
    // other object is, without running the getter.
    let reads = 0;
    const value = brandedUnfrozen('<b>ok</b>');
    Object.defineProperty(value, 'value', {
      get: () => {
        reads++;
        return '<b>ok</b>';
      },
    });
    expect(isHTMLLike(value)).toBe(false);
    const ordinary = { $$kind: 'html', value: '<b>ok</b>' } as const;
    expect(write(value)).toBe(write(ordinary as unknown as HTMLLikeValue));
    expect(reads).toBe(0);
  });

  it('rejects markup that is not a string (TSG_ERR_INVALID_HTML_LIKE)', () => {
    const value = brandedUnfrozen('<b>ok</b>');
    const notString = new Proxy(value, {
      get: (target, key, receiver) =>
        key === 'value'
          ? { toString: () => 'x>] b [shape=box' }
          : Reflect.get(target, key, receiver),
    });
    expect(() => write(notString)).toThrow(
      expect.objectContaining({
        name: 'RangeError',
        code: 'TSG_ERR_INVALID_HTML_LIKE',
      }),
    );
  });
});
