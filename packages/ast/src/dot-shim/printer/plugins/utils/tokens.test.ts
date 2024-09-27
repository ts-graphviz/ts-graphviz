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

  test('should escape multiple characters', () => {
    expect(escape('\r\n"')).toBe(String.raw`\r\n\"`);
  });

  test('should not escape other characters', () => {
    expect(escape('abc')).toBe('abc');
  });

  test('should not escape escaped characters', () => {
    expect(escape(String.raw`\r\n\"`)).toBe(String.raw`\r\n\"`);
  });

  test('should not escape empty string', () => {
    expect(escape('')).toBe('');
  });
});
