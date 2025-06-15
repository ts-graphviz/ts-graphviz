import { describe, expect, it } from 'vitest';
import { toFile, toStream } from './browser.js';

describe('browser adapter', () => {
  it('toStream throws error with correct message', () => {
    expect(() => toStream('dot', {})).toThrowErrorMatchingInlineSnapshot(
      `[Error: This module cannot be run in a browser.]`,
    );
  });

  it('toFile throws error with correct message', () => {
    expect(() => toFile('dot', 'path', {})).toThrowErrorMatchingInlineSnapshot(
      `[Error: This module cannot be run in a browser.]`,
    );
  });
});
