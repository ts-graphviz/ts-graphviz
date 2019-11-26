import { LblStringValue } from '../valueType';
describe('valueType', () => {
  describe('LblStringValue', () => {
    describe('plain string', () => {
      test.each([['test']])('toDot result should be quoted', input => {
        const value = new LblStringValue(input);
        const dot = value.toDot();
        expect(dot).toMatch(/".+"/);
        expect(dot).not.toMatch(/<.+>/);
      });
    });

    describe('HTML Like string', () => {
      test.each([
        ['<<B>hoge</B>>'],
        [
          `<
          <U>hoge</U>
          >`,
        ],
        [
          `
          <<I>hoge</I>
          >
          `,
        ],
      ])('toDot result should not be quoted', input => {
        const value = new LblStringValue(input);
        const dot = value.toDot();
        expect(dot).not.toMatch(/".+"/);
        expect(dot).toMatch(/<.+>/);
      });
    });
  });
});
