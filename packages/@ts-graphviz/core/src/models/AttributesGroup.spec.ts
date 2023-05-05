import { AttributesGroup } from './AttributesGroup.js';

let attrs: AttributesGroup;
beforeEach(() => {
  attrs = new AttributesGroup();
});

describe('comment', () => {
  test('default value to be undefined', () => {
    expect(attrs.comment).toBeUndefined();
  });

  test('comment can be set', () => {
    attrs.comment = 'test';
    expect(attrs.comment).toStrictEqual('test');
  });
});
