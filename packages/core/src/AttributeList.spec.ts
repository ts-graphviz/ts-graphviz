import { AttributeListKind } from '@ts-graphviz/common';
import { beforeEach, describe, expect, it, test } from 'vitest';
import { AttributeList } from './AttributeList.js';
import { AttributesBase } from './AttributesBase.js';
import { DotObject } from './DotObject.js';

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
    expect(attrs.$$type).toStrictEqual('AttributeList');
  });
});

describe('constructor', () => {
  describe('1st argument is kind of AttributeList', () => {
    test.each(['Node', 'Edge', 'Graph'] as AttributeListKind[])(
      'AttributeList kind is %s',
      (kind) => {
        attrs = new AttributeList(kind);
        expect(attrs.$$kind).toStrictEqual(kind);
      },
    );
  });

  test('2nd argument is attribute object', () => {
    attrs = new AttributeList('Node', {
      label: 'Label',
    });
    expect(attrs.size).toBe(1);
    expect(attrs.get('label')).toBe('Label');
  });
});

describe('comment', () => {
  test('default value to be undefined', () => {
    expect(attrs.comment).toBeUndefined();
  });

  test('comment can be set', () => {
    attrs.comment = 'test';
    expect(attrs.comment).toStrictEqual('test');
  });
});
