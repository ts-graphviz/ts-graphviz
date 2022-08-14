import { toDot } from '../to-dot.js';

describe('AttributesValue rendering', () => {
  const DoubleQuotedValuePattern = /^".+"$/ms;
  const HTMLLikeValuePattern = /^<.+>$/ms;

  describe('Literal', () => {
    describe('plain string', () => {
      test.each([
        ['te"st'],
        [
          `
          test
          `,
        ],
      ])('toDot result should be quoted', (value) => {
        const dot = toDot(value);
        expect(dot).toMatch(DoubleQuotedValuePattern);
        expect(dot).not.toMatch(HTMLLikeValuePattern);
        expect(dot).toMatchSnapshot();
      });
    });

    describe('escape characters', () => {
      test.each([
        ['colon', '1:2', '"1:2"'],
        ['semi-colon', '1;2', '"1;2"'],
        ['equal', '1=2', '"1=2"'],
        ['dash', '1-2', '"1-2"'],
        ['sharp', '1#2', '"1#2"'],
        ['space', '1 2', '"1 2"'],
        ['newline', '1\n2', '"1\\n2"'],
        ['tab', '1\t2', '"1\t2"'],
        ['double-quotation', '1"2', '"1\\"2"'],
        ['slash', '1/2', '"1/2"'],
      ])('escaped if literal contains %s character', (_name, value, expected) => {
        const dot = toDot(value);
        expect(dot).toBe(expected);
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
      ])('toDot result should not be quoted', (value) => {
        const dot = toDot(value);
        expect(dot).not.toMatch(DoubleQuotedValuePattern);
        expect(dot).toMatch(HTMLLikeValuePattern);
        expect(dot).toMatchSnapshot();
      });
    });
  });
});
