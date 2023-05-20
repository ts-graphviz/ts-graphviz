/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, test, expect, describe, beforeEach } from 'vitest';
import { Attributes } from '@ts-graphviz/common';
import { attribute as _ } from '../attribute.js';
import { AttributesBase } from './AttributesBase.js';
import { DotObject } from './DotObject.js';

class TestAttributes extends AttributesBase<any> {}

let attrs: Attributes<any>;
beforeEach(() => {
  attrs = new TestAttributes();
});

describe('object', () => {
  it('should be instance of AttributesBase/DotObject', () => {
    expect(attrs).toBeInstanceOf(DotObject);
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
    expect(attrs.get(_.label)).toBeUndefined();
  });

  test('with attribute object', () => {
    attrs = new TestAttributes({
      [_.label]: 'Label',
    });
    expect(attrs.size).toBe(1);
    expect(attrs.get(_.label)).toBe('Label');
  });
});

describe('apply method', () => {
  test('with attributes object', () => {
    attrs.apply({
      [_.label]: 'this is test',
      [_.color]: 'red',
      [_.fontsize]: 16,
    });
    expect(attrs.size).toBe(3);
  });

  test('with attributes entities', () => {
    attrs.apply([
      [_.label, 'this is test'],
      [_.color, 'red'],
      [_.fontsize, 16],
    ]);
    expect(attrs.size).toBe(3);
  });
});

test('clear method', () => {
  attrs = new TestAttributes({
    [_.label]: 'this is test',
    [_.color]: 'red',
    [_.fontsize]: 16,
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
