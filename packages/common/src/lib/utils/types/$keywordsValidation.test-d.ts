import { describe, expectTypeOf, test } from 'vitest';
import type { $keywords } from './$keywords.js';
import type { $keywordsValidation } from './$keywordsValidation.js';

describe('$keywordsValidation', () => {
  test('', () => {
    interface A extends $keywords<'valid' | 'foo bar'>, $keywordsValidation {}

    expectTypeOf<A>().toMatchTypeOf<{
      valid: 'valid';
      // 'foo bar': 'foo bar';
    }>();
  });
});
