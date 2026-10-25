import { describe, expect, it } from 'vitest';
import { ERROR_CODES, isTsGraphvizError, withCode } from './errors.js';

describe('withCode', () => {
  it('tags the error in place and keeps its type, name and cause', () => {
    const error = withCode(
      new RangeError('why', { cause: 'root' }),
      'TSG_ERR_NUL_CHARACTER',
    );
    expect(error).toBeInstanceOf(RangeError);
    expect(error.name).toBe('RangeError');
    expect(error.message).toBe('why');
    expect(error.cause).toBe('root');
    expect(error.code).toBe('TSG_ERR_NUL_CHARACTER');
    expect(Object.keys(error)).toContain('code');
  });
});

describe('withCode on a DOMException', () => {
  it('replaces the legacy numeric code with the string code', () => {
    const error = withCode(
      new DOMException('unsafe', 'SecurityError'),
      'TSG_ERR_UNSAFE_DOT',
    );
    expect(error).toBeInstanceOf(DOMException);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('SecurityError');
    expect(error.code).toBe('TSG_ERR_UNSAFE_DOT');
    expect(isTsGraphvizError(error)).toBe(true);
  });
});

describe('isTsGraphvizError', () => {
  it('accepts an error with a known code, whatever its prototype', () => {
    expect(
      isTsGraphvizError(withCode(new Error('x'), 'TSG_ERR_NO_GRAPH')),
    ).toBe(true);
    // Cross-realm or duplicated-package errors are plain objects to `instanceof`.
    expect(
      isTsGraphvizError({
        name: 'Error',
        message: 'x',
        code: 'TSG_ERR_NO_GRAPH',
      }),
    ).toBe(true);
  });

  it('rejects other errors and values', () => {
    expect(isTsGraphvizError(new Error('x'))).toBe(false);
    expect(
      isTsGraphvizError(Object.assign(new Error('x'), { code: 'ENOENT' })),
    ).toBe(false);
    expect(isTsGraphvizError(null)).toBe(false);
    expect(isTsGraphvizError('TSG_ERR_NO_GRAPH')).toBe(false);
  });

  it('codes are unique and prefixed', () => {
    expect(new Set(ERROR_CODES).size).toBe(ERROR_CODES.length);
    for (const code of ERROR_CODES) expect(code).toMatch(/^TSG_ERR_[A-Z_]+$/);
  });
});
