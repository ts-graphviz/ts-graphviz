import { DotBase, GraphvizObject } from '../../abstract';
import { attribute } from '../../attribute';
import { Attributes } from '../Attributes';
import { AttributesBase } from '../AttributesBase';
import { ID } from '../ID';

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
      expect(attrs.toDot()).toMatchSnapshot();
    });

    it('one attribute', () => {
      attrs.set('label', 'test');
      expect(attrs.toDot()).toMatchSnapshot();
    });

    it('some attributes', () => {
      attrs.set('label', 'test');
      attrs.set('color', 'red');
      expect(attrs.toDot()).toMatchSnapshot();
    });

    test('set some attributes by apply', () => {
      attrs.apply({
        label: 'this is test',
        color: 'red',
        fontsize: 16,
      });
      expect(attrs.toDot()).toMatchSnapshot();
    });

    test('set/get attribute', () => {
      const id = new ID('test');
      attrs.set('label', id);
      expect(attrs.get('label')).toBe(id);
    });

    describe('edge with comment', () => {
      beforeEach(() => {
        attrs.set('label', 'test');
        attrs.set('color', 'red');
      });
      test('single line comment', () => {
        attrs.comment = 'this is comment.';
        expect(attrs.toDot()).toMatchSnapshot();
      });

      test('multi line comment', () => {
        attrs.comment = 'this is comment.\nsecond line.';
        expect(attrs.toDot()).toMatchSnapshot();
      });
    });
  });
});
