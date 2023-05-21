import { it, test, expect, describe, beforeEach } from 'vitest';

import { AttributeList, NodeAttributeList } from './AttributeList.js';
import { AttributesBase } from './AttributesBase.js';
import { DotObject } from './DotObject.js';
import { getASTType } from '@ts-graphviz/common';

let attrs: NodeAttributeList;
beforeEach(() => {
  attrs = new NodeAttributeList();
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
    expect(getASTType(attrs)).toBe('AttributeList');
  });
});

describe('constructor', () => {
  test('ast argument is attribute object', () => {
    attrs = new NodeAttributeList({
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
    expect(attrs.comment).toBe('test');
  });
});
