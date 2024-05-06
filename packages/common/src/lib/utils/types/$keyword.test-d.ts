import { it } from 'node:test';
import { describe, expectTypeOf } from 'vitest';
import type { $keywords } from './$keywords.js';

describe('$keyword', () => {
  it('should expand to object', () => {
    expectTypeOf<$keywords<'foo' | 'bar'>>().toEqualTypeOf<{
      foo: 'foo';
      bar: 'bar';
    }>;
  });
});
