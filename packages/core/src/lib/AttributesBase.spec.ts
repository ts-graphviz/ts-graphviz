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
