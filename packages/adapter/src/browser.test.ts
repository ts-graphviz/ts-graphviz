import { isTsGraphvizError } from '@ts-graphviz/common';
import { describe, expect, it } from 'vitest';
import * as browser from './browser.js';
import { toBlob } from './browser.js';

function thrownBy(fn: () => unknown): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  return undefined;
}

describe('browser adapter', { tags: ['SM-4'] }, () => {
  it('toBlob throws synchronously with TSG_ERR_UNSUPPORTED_ENVIRONMENT', () => {
    const error = thrownBy(() => toBlob('dot', {}));
    expect(isTsGraphvizError(error)).toBe(true);
    expect(error).toMatchObject({
      name: 'Error',
      code: 'TSG_ERR_UNSUPPORTED_ENVIRONMENT',
    });
  });

  it('has no toStream or toFile (removed in v4)', () => {
    expect(browser).not.toHaveProperty('toStream');
    expect(browser).not.toHaveProperty('toFile');
  });
});
