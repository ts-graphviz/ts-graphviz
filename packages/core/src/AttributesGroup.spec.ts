import { beforeEach, describe, expect, test } from 'vitest';
import { AttributesGroup } from './AttributesGroup.js';

let attrs: AttributesGroup;
beforeEach(() => {
  attrs = new AttributesGroup();
});

describe('AttributesGroup', () => {
  test('holds attribute values', () => {
    expect(attrs.size).toBe(0);
    attrs.set('label', 'x');
    expect(attrs.get('label')).toBe('x');
    expect(attrs.size).toBe(1);
  });

  test('has no comment slot of its own (use the model comment)', () => {
    expect('comment' in attrs).toBe(false);
  });
});
