import type { Attributes } from '@ts-graphviz/common';
import { beforeEach, describe, expect, it, test } from 'vitest';
import { AttributesBase } from './AttributesBase.js';

class TestAttributes extends AttributesBase<any> {}

let attrs: Attributes<any>;
beforeEach(() => {
  attrs = new TestAttributes();
});

describe('object', () => {
  it('should be instance of AttributesBase', () => {
    expect(attrs).toBeInstanceOf(AttributesBase);
  });

  it('size should be 0 by default', () => {
    expect(attrs.size).toBe(0);
  });
});

describe('constructor', () => {
  test('with no attribute object', () => {
    attrs = new TestAttributes();
    expect(attrs.size).toBe(0);
    expect(attrs.get('label')).toBeUndefined();
  });

  test('with attribute object', () => {
    attrs = new TestAttributes({
      label: 'Label',
    });
    expect(attrs.size).toBe(1);
    expect(attrs.get('label')).toBe('Label');
  });
});

describe('apply method', () => {
  test('with attributes object', () => {
    attrs.apply({
      label: 'this is test',
      color: 'red',
      fontsize: 16,
    });
    expect(attrs.size).toBe(3);
  });

  test('with attributes entities', () => {
    attrs.apply([
      ['label', 'this is test'],
      ['color', 'red'],
      ['fontsize', 16],
    ]);
    expect(attrs.size).toBe(3);
  });

  test('every write goes through setAttribute, so a class that overrides it sees the values', () => {
    const seen: [string, unknown][] = [];
    class Recording extends AttributesBase<any> {
      override setAttribute(key: string, value: unknown): void {
        seen.push([key, value]);
        super.setAttribute(key, value);
      }
    }
    const recording = new Recording({ label: 'a' });
    recording.setAttributes([['color', 'red']]);
    recording.apply({ shape: 'box' });
    recording.set('style', 'filled');
    expect(seen).toEqual([
      ['label', 'a'],
      ['color', 'red'],
      ['shape', 'box'],
      ['style', 'filled'],
    ]);
  });
});

describe('the DOM names', () => {
  test('set, read, list and remove attributes', () => {
    const a = new TestAttributes({ label: 'A' });
    a.setAttribute('color', 'red');
    a.setAttribute('shape', undefined as never);
    expect(a.getAttribute('label')).toBe('A');
    expect(a.hasAttribute('color')).toBe(true);
    expect(a.hasAttribute('shape')).toBe(false);
    expect(a.getAttributeNames()).toEqual(['label', 'color']);
    a.removeAttribute('label');
    expect(a.getAttributeNames()).toEqual(['color']);
    a.setAttributes({ style: 'filled', fontsize: 12 });
    expect(a.getAttributeNames()).toEqual(['color', 'style', 'fontsize']);
    a.removeAttributes();
    expect(a.getAttributeNames()).toEqual([]);
  });

  test('the deprecated names read and write the same attributes', () => {
    const a = new TestAttributes();
    a.set('label', 'A');
    expect(a.getAttribute('label')).toBe('A');
    a.setAttribute('color', 'red');
    expect(a.get('color')).toBe('red');
    expect(a.size).toBe(2);
    expect(a.values).toEqual([
      ['label', 'A'],
      ['color', 'red'],
    ]);
    a.delete('label');
    expect(a.hasAttribute('label')).toBe(false);
    a.clear();
    expect(a.getAttributeNames()).toEqual([]);
  });
});

test('clear method', () => {
  attrs = new TestAttributes({
    label: 'this is test',
    color: 'red',
    fontsize: 16,
  });

  expect(attrs.size).toBe(3);
  attrs.clear();
  expect(attrs.size).toBe(0);
});

test('set/get/delete methods', () => {
  const id = 'test';
  attrs.set('label', id);
  expect(attrs.get('label')).toBe(id);
  attrs.delete('label');
  expect(attrs.get('label')).toBeUndefined();
});
