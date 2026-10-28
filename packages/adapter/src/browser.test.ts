import { isTsGraphvizError } from '@ts-graphviz/common';
import { describe, expect, it } from 'vitest';
import { toFile, toStream } from './browser.js';

function thrownBy(fn: () => unknown): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  return undefined;
}

describe('browser adapter', { tags: ['SM-4'] }, () => {
  it.each([
    ['toStream', () => toStream('dot', {})],
    ['toFile', () => toFile('dot', 'path', {})],
  ])(
    '%s throws synchronously with TSG_ERR_UNSUPPORTED_ENVIRONMENT',
    (_, call) => {
      const error = thrownBy(call);
      expect(isTsGraphvizError(error)).toBe(true);
      expect(error).toMatchObject({
        name: 'Error',
        code: 'TSG_ERR_UNSUPPORTED_ENVIRONMENT',
      });
    },
  );
});
