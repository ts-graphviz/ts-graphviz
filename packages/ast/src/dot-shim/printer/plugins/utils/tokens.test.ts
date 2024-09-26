import { describe, expect, test } from 'vitest';
import { escape } from './tokens.js';

describe('escape', () => {
  test.each([
    ['\r', '\\r'],
    ['\n', '\\n'],
    ['"', '\\"'],
    [String.raw`a\la`, String.raw`a\la`],
  ])('should escape %s to %s', (value, expected) => {
    expect(escape(value)).toBe(expected);
  });
});
