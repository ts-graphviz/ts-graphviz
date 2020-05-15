import { DotObject, GraphvizObject } from '../abstract';
import { Attributes, AttributesBase } from '../attributes-base';

describe('class Attributes', () => {
  let attrs: Attributes;
  beforeEach(() => {
    attrs = new Attributes();
  });

  it('should be instance of Attributes/AttributesBase/DotObject/GraphvizObject', () => {
    expect(attrs).toBeInstanceOf(Attributes);
    expect(attrs).toBeInstanceOf(AttributesBase);
    expect(attrs).toBeInstanceOf(DotObject);
    expect(attrs).toBeInstanceOf(GraphvizObject);
  });

  it('size should be 0 by default', () => {
    expect(attrs.size).toBe(0);
  });

  describe('renders correctly by toDot method', () => {
    test('apply/clear attribute', () => {
      attrs.apply({
        label: 'this is test',
        color: 'red',
        fontsize: 16,
      });
      expect(attrs.size).toBe(3);
      attrs.clear();
      expect(attrs.size).toBe(0);
    });

    test('set/get/delete attribute', () => {
      const id = 'test';
      attrs.set('label', id);
      expect(attrs.get('label')).toBe(id);
      attrs.delete('label');
      expect(attrs.get('label')).toBeUndefined();
    });

    describe('edge with comment', () => {
      beforeEach(() => {
        attrs.set('label', 'test');
        attrs.set('color', 'red');
      });
    });
  });
});
