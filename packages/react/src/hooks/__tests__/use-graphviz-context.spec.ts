import { renderHook } from '@testing-library/react-hooks';
import { context } from './utils/wrapper';
import { useGraphvizContext } from '../use-graphviz-context';
import { NoGraphvizContextErrorMessage } from '../../utils/errors';

describe('useGraphvizContext', () => {
  test('returns {}', () => {
    const { result } = renderHook(() => useGraphvizContext(), {
      wrapper: context(),
    });
    expect(result.current).toStrictEqual({});
  });

  test('An error occurs when called outside the GraphvizContext', () => {
    const { result } = renderHook(() => useGraphvizContext());
    expect(result.error).toStrictEqual(Error(NoGraphvizContextErrorMessage));
  });
});
