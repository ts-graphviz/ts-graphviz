import { toDot } from '../../render/to-dot';
import { Attributes } from '../../model/attributes-base';
import { attribute } from '../../attribute';

describe('Attributes rendering', () => {
  let attrs: Attributes;
  beforeEach(() => {
    attrs = new Attributes();
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

    test('set undefined attributes by apply', () => {
      attrs.apply({
        label: undefined,
      });
      expect(attrs.size).toBe(0);
      expect(toDot(attrs)).toMatchSnapshot();
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
