/* eslint-disable @typescript-eslint/no-explicit-any */
import { Builder } from './builder.js';

describe('Builder', () => {
  test('should create an ASTNode with specified properties', () => {
    const location = {
      start: {
        offset: 0,
        line: 1,
        column: 1,
      },
      end: {
        offset: 3,
        line: 1,
        column: 3,
      },
    };
    const builder = new Builder({
      locationFunction: () => location,
    });
    const type = 'TestType' as any;
    const props = { prop1: 'test1', prop2: 'test2' };
    const children = [
      { type: 'TestType', props: { prop1: 'test1', prop2: 'test2' } },
    ] as any[];
    const expectedResult = {
      type,
      ...props,
      children,
      location,
    };
    expect(builder.createElement(type, props, children)).toStrictEqual(
      expectedResult,
    );
  });
});
