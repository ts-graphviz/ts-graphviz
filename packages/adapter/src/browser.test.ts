import { describe, expect, it } from 'vitest';
import { ERROR_MESSAGE, toFile, toStream } from './browser.js';

describe('browser adapter', () => {
  it('toStream throws error with correct message', () => {
    expect(() => toStream('dot', {})).toThrow(ERROR_MESSAGE);
  });

  it('toFile throws error with correct message', () => {
    expect(() => toFile('dot', 'path', {})).toThrow(ERROR_MESSAGE);
  });
});
