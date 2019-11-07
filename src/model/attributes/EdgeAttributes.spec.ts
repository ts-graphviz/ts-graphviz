import { EdgeAttributes } from './EdgeAttributes';

describe('class EdgeAttributes', () => {
  let attrs: EdgeAttributes;
  beforeEach(() => {
    attrs = new EdgeAttributes();
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
  });
});
