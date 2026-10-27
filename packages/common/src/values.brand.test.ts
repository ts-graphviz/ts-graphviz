import { describe, expect, it } from 'vitest';
import { escString, htmlLike, isEscString, isHTMLLike } from './values.js';

describe('value kinds cannot be forged from data', { tags: ['SM-3'] }, () => {
  it('recognises only values made by escString and htmlLike', () => {
    expect(isHTMLLike(htmlLike('<b>x</b>'))).toBe(true);
    expect(isEscString(escString('\\N'))).toBe(true);
    expect(isHTMLLike({ $$kind: 'html', value: '<b>x</b>' })).toBe(false);
    expect(isEscString({ $$kind: 'escString', value: '\\N' })).toBe(false);
  });

  it('does not recognise a value that went through JSON', () => {
    const parsed = JSON.parse(JSON.stringify(htmlLike('<b>x</b>')));
    expect(parsed).toStrictEqual({ $$kind: 'html', value: '<b>x</b>' });
    expect(isHTMLLike(parsed)).toBe(false);
  });

  it('does not take the brand from the prototype', () => {
    const forged = Object.create(htmlLike('<b>x</b>'));
    expect(isHTMLLike(forged)).toBe(false);
  });

  it('keeps the values equal to their fields', () => {
    expect(htmlLike('<b>x</b>')).toStrictEqual({
      $$kind: 'html',
      value: '<b>x</b>',
    });
    expect(Object.isFrozen(escString('x'))).toBe(true);
  });
});
