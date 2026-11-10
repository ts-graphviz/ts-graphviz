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
});
