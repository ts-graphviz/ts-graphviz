import { DotBase, GraphvizObject } from '../../abstract';
import { attribute } from '../../attribute';
import { Attributes } from '../Attributes';
import { AttributesBase } from '../AttributesBase';
import { toDot } from '../../utils/dot-rendering';

describe('class Attributes', () => {
  let attrs: Attributes<attribute.Attribute>;
  beforeEach(() => {
    attrs = new Attributes();
  });

  it('should be instance of Attributes/AttributesBase/DotBase/GraphvizObject', () => {
    expect(attrs).toBeInstanceOf(Attributes);
    expect(attrs).toBeInstanceOf(AttributesBase);
    expect(attrs).toBeInstanceOf(DotBase);
    expect(attrs).toBeInstanceOf(GraphvizObject);
  });

  it('size should be 0 by default', () => {
    expect(attrs.size).toBe(0);
  });

  describe('renders correctly by toDot method', () => {
    it('no attributes', () => {
      expect(toDot(attrs)).toMatchSnapshot();
    });

    it('one attribute', () => {
      attrs.set('label', 'test');
      expect(toDot(attrs)).toMatchSnapshot();
    });

    it('some attributes', () => {
      attrs.set('label', 'test');
      attrs.set('color', 'red');
      expect(toDot(attrs)).toMatchSnapshot();
    });

    test('set some attributes by apply', () => {
      attrs.apply({
        label: 'this is test',
        color: 'red',
        fontsize: 16,
      });
      expect(toDot(attrs)).toMatchSnapshot();
    });

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
      expect(attrs.get('label')?.value).toBe(id);
      attrs.delete('label');
      expect(attrs.get('label')).toBeUndefined();
    });

    describe('edge with comment', () => {
      beforeEach(() => {
        attrs.set('label', 'test');
        attrs.set('color', 'red');
      });
      test('single line comment', () => {
        attrs.comment = 'this is comment.';
        expect(toDot(attrs)).toMatchSnapshot();
      });

      test('multi line comment', () => {
        attrs.comment = 'this is comment.\nsecond line.';
        expect(toDot(attrs)).toMatchSnapshot();
      });
    });
  });
});
