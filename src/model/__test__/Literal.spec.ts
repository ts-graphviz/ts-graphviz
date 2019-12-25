import { Literal } from '../Literal';

const DoubleQuotedValuePattern = /^".+"$/ms;
const HTMLLikeValuePattern = /^<.+>$/ms;

describe('valueType', () => {
  describe('Literal', () => {
    describe('plain string', () => {
      test.each([
        ['te"st'],
        [
          `
          test
          `,
        ],
      ])('toDot result should be quoted', input => {
        const value = new Literal(input);
        const dot = value.toDot();
        expect(dot).toMatch(DoubleQuotedValuePattern);
        expect(dot).not.toMatch(HTMLLikeValuePattern);
        expect(dot).toMatchSnapshot();
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
        const value = new Literal(input);
        const dot = value.toDot();
        expect(dot).not.toMatch(DoubleQuotedValuePattern);
        expect(dot).toMatch(HTMLLikeValuePattern);
      });
    });
  });
});
