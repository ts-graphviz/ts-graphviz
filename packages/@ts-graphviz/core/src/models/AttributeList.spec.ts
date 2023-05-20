import { it, test, expect, describe, beforeEach } from 'vitest';

import { attribute as _ } from '../attribute.js';
import { AttributeList } from './AttributeList.js';
import { AttributesBase } from './AttributesBase.js';
import { DotObject } from './DotObject.js';
import { AttributeListKind } from '@ts-graphviz/common';

let attrs: AttributeList<AttributeListKind>;
beforeEach(() => {
  attrs = new AttributeList('Node');
});

describe('object', () => {
  it('should be instance of AttributeList/AttributesBase/DotObject', () => {
    expect(attrs).toBeInstanceOf(AttributeList);
    expect(attrs).toBeInstanceOf(AttributesBase);
    expect(attrs).toBeInstanceOf(DotObject);
  });

  it('size should be 0 by default', () => {
    expect(attrs.size).toBe(0);
  });

  it('$$type property should returns "AttributeList"', () => {
    expect(attrs.$$type).toBe('AttributeList');
  });
});

describe('constructor', () => {
  describe('1st argument is kind of AttributeList', () => {
    test.each(['Node', 'Edge', 'Graph'] as AttributeListKind[])('AttributeList kind is %s', (kind) => {
      attrs = new AttributeList(kind);
      expect(attrs.$$kind).toStrictEqual(kind);
    });
  });

  test('2nd argument is attribute object', () => {
    attrs = new AttributeList('Node', {
      [_.label]: 'Label',
    });
    expect(attrs.size).toBe(1);
    expect(attrs.get(_.label)).toBe('Label');
  });
});

describe('comment', () => {
  test('default value to be undefined', () => {
    expect(attrs.comment).toBeUndefined();
  });

  test('comment can be set', () => {
    attrs.comment = 'test';
    expect(attrs.comment).toBe('test');
  });
});
