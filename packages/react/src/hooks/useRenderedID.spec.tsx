// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { context } from './__tests__/wrapper.js';
import { useRenderedID } from './useRenderedID.js';

describe('useRenderedID', () => {
  it('should return the same value as the input, when input is string', () => {
    const { result } = renderHook(() => useRenderedID('foo'), {
      wrapper: context(),
    });
    expect(result.current).toBe('foo');
  });

  it('should return the same value as the input, when input is HTMLLike string', () => {
    const { result } = renderHook(() => useRenderedID('<<b>bold</b>>'), {
      wrapper: context(),
    });
    expect(result.current).toBe('<<b>bold</b>>');
  });

  it('should return the HTMLLike string, when input is JSX', () => {
    const { result } = renderHook(() => useRenderedID(<dot:b>bold</dot:b>), {
      wrapper: context(),
    });
    expect(result.current).toBe('<<b>bold</b>>');
  });
});
