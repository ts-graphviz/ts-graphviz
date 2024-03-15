import { renderHook } from '@testing-library/react-hooks';
import { describe, expect, test } from 'vitest';
import { DOT } from '../../labels.js';
import { useRenderedID } from '../use-rendered-id.js';
import { context } from './utils/wrapper.js';

describe('useRenderedID', () => {
  test.each([
    'hoge',
    '<<b>bold</b>>',
    <DOT.B>bold</DOT.B>,
    <DOT.TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
      <DOT.TR>
        <DOT.TD>left</DOT.TD>
        <DOT.TD PORT="m">middle</DOT.TD>
        <DOT.TD PORT="r">right</DOT.TD>
      </DOT.TR>
    </DOT.TABLE>,
  ])('case', (id) => {
    const { result } = renderHook(() => useRenderedID(id), {
      wrapper: context(),
    });
    expect(result.current).toMatchSnapshot();
  });
});
