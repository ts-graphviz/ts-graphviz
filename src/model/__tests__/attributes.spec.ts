import { attribute } from '../../attribute/index.js';
import { DotObject, GraphvizObject } from '../models.js';
import { AttributeList, AttributesBase } from '../models.js';

describe('class AttributeList', () => {
  let attrs: AttributeList<'Node'>;
  beforeEach(() => {
    attrs = new AttributeList('Node');
  });

  it('should be instance of AttributeList/AttributesBase/DotObject/GraphvizObject', () => {
    expect(attrs).toBeInstanceOf(AttributeList);
    expect(attrs).toBeInstanceOf(AttributesBase);
    expect(attrs).toBeInstanceOf(DotObject);
    expect(attrs).toBeInstanceOf(GraphvizObject);
  });

  it('size should be 0 by default', () => {
    expect(attrs.size).toBe(0);
  });

  describe('Constructor', () => {
    test('with attribute object', () => {
      attrs = new AttributeList('Node', {
        [attribute.label]: 'Label',
      });
      expect(attrs.size).toBe(1);
      expect(attrs.get(attribute.label)).toBe('Label');
    });
  });

  describe('apply/clear attribute', () => {
    test('with attributes object', () => {
      attrs.apply({
        [attribute.label]: 'this is test',
        [attribute.color]: 'red',
        [attribute.fontsize]: 16,
      });
      expect(attrs.size).toBe(3);
      attrs.clear();
      expect(attrs.size).toBe(0);
    });

    test('with entities', () => {
      attrs.apply([
        [attribute.label, 'this is test'],
        [attribute.color, 'red'],
        [attribute.fontsize, 16],
      ]);
      expect(attrs.size).toBe(3);
      attrs.clear();
      expect(attrs.size).toBe(0);
    });
  });

  test('set/get/delete attribute', () => {
    const id = 'test';
    attrs.set('label', id);
    expect(attrs.get('label')).toBe(id);
    attrs.delete('label');
    expect(attrs.get('label')).toBeUndefined();
  });
});
