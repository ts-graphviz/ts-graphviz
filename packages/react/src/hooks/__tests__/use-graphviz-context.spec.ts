import { Context } from 'ts-graphviz';
import { renderHook } from '@testing-library/react-hooks';
import { context } from './utils/wrapper';
import { useGraphvizContext } from '../use-graphviz-context';

describe('useGraphvizContext', () => {
  test('returns Context instance', () => {
    const { result } = renderHook(() => useGraphvizContext(), {
      wrapper: context,
    });
    expect(result.current).toBeInstanceOf(Context);
  });
});
